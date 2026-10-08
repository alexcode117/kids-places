"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

interface Slide {
  url: string | null;
  caption: string | null;
}

function slidesFor(place: Place): Slide[] {
  if (place.photos.length) return place.photos.map((p) => ({ url: p.url, caption: p.caption }));
  return [{ url: null, caption: "Sin fotos todavía" }];
}

function SlideView({ place, slide, index, thumb = false }: { place: Place; slide: Slide; index: number; thumb?: boolean }) {
  return slide.url ? (
    <Image
      src={slide.url}
      alt={thumb ? "" : (slide.caption ?? place.name)}
      fill
      sizes={thumb ? "64px" : "(width < 860px) 100vw, 420px"}
      className="object-cover"
    />
  ) : (
    <PhotoPlaceholder category={place.category} index={index} caption={thumb ? null : slide.caption} />
  );
}

/** Galería deslizable con el dedo (scroll-snap); en escritorio también con flechas y miniaturas. */
export function Gallery({ place }: { place: Place }) {
  const slides = slidesFor(place);
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = (i + slides.length) % slides.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = track.current;
    if (el) setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div>
      <div className="relative max-w-full overflow-hidden rounded-[20px] mobile:-mx-4 mobile:rounded-none">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex aspect-[16/10] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s, i) => (
            <div key={i} className="relative w-full shrink-0 snap-center" aria-hidden={i !== current}>
              <SlideView place={place} slide={s} index={i} />
            </div>
          ))}
        </div>
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Foto anterior"
              className="absolute top-1/2 left-2.5 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#23404c] shadow mobile:hidden"
            >
              <Icon name="back" />
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Foto siguiente"
              className="absolute top-1/2 right-2.5 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#23404c] shadow mobile:hidden"
            >
              <Icon name="next" />
            </button>
            <span className="absolute right-2.5 bottom-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-extrabold text-white tabular-nums">
              {current + 1} / {slides.length}
            </span>
          </>
        ) : null}
      </div>
      {slides.length > 1 ? (
        <div className="mt-2.5 flex gap-2 overflow-x-auto mobile:hidden">
          {slides.map((s, n) => (
            <button
              key={n}
              type="button"
              onClick={() => goTo(n)}
              aria-label={`Ver foto ${n + 1}`}
              aria-current={n === current}
              className={`relative h-11 w-16 flex-none overflow-hidden rounded-[10px] border-2 ${n === current ? "border-orange" : "border-transparent"}`}
            >
              <SlideView place={place} slide={s} index={n} thumb />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
