import { getCategory } from "@kids-place/tokens";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AccountButton } from "@/components/auth/AccountButton";
import { PlaceDetail } from "@/components/place/PlaceDetail";
import { Icon } from "@/components/ui/Icon";
import { Logotype } from "@/components/ui/Logo";
import { getAds, getPlaceBySlug, getPlaceSlugs } from "@/lib/data";

export async function generateStaticParams() {
  const slugs = await getPlaceSlugs();
  // Con Cache Components debe haber al menos un parámetro.
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__vacio__" }];
}

export async function generateMetadata({ params }: PageProps<"/sitios/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return { title: "Sitio no encontrado" };
  const description = `${getCategory(place.category).name} en ${place.zone}, ${place.cityName}. ${place.description}`.slice(0, 160);
  const image = place.photos[0]?.url;
  return {
    title: place.name,
    description,
    alternates: { canonical: `/sitios/${place.slug}` },
    openGraph: { title: place.name, description, type: "article", ...(image ? { images: [image] } : {}) },
  };
}

export default function PlacePage({ params }: PageProps<"/sitios/[slug]">) {
  return (
    <div className="min-h-dvh">
      <header className="flex items-center gap-4 border-b border-line bg-surface px-5 pt-[calc(0.625rem+env(safe-area-inset-top))] pb-2.5 mobile:px-4">
        <Link href="/" aria-label="Kids·Place, inicio">
          <Logotype className="h-8 w-auto" />
        </Link>
        <div className="ml-auto">
          <AccountButton />
        </div>
      </header>
      <main className="mx-auto max-w-[720px] px-5 pt-4 pb-12 mobile:px-4 mobile:pt-2 mobile:pb-0">
        <Suspense fallback={<PlaceSkeleton />}>{params.then(({ slug }) => <PlaceContent slug={slug} />)}</Suspense>
      </main>
    </div>
  );
}

async function PlaceContent({ slug }: { slug: string }) {
  const [place, ads] = await Promise.all([getPlaceBySlug(slug), getAds()]);
  if (!place) notFound();
  return (
    <>
      <Link
        href={`/?sitio=${place.slug}`}
        className="mb-3 inline-flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 font-extrabold text-brand-ink hover:bg-chip"
      >
        <Icon name="pin" /> Ver en el mapa
      </Link>
      <PlaceDetail place={place} ad={ads.find((a) => a.placement === "detail")} />
    </>
  );
}

function PlaceSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 pt-12" aria-label="Cargando sitio">
      <div className="aspect-[16/10] rounded-[20px] bg-chip" />
      <div className="h-9 w-2/3 rounded-xl bg-chip" />
      <div className="h-24 rounded-2xl bg-chip" />
    </div>
  );
}
