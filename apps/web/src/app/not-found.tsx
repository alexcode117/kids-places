import Link from "next/link";
import { Face } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <Face className="mx-auto w-32" />
        <h1 className="mt-3 font-display text-4xl text-brand-ink">No encontramos este sitio</h1>
        <p className="mt-1 text-ink-2">Puede que lo hayan quitado o que el enlace esté incompleto.</p>
        <Link href="/" className="mt-5 inline-block rounded-full bg-orange px-5 py-2.5 font-extrabold text-on-orange">
          Ir al mapa
        </Link>
      </div>
    </main>
  );
}
