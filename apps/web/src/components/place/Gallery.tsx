"use client";

import Image from "next/image";
import { useState } from "react";
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

function SlideView({ place, slide, index, sizes }: { place: Place; slide: Slide; index: number; sizes: string }) {
  return slide.url ? (
    <Image src={slide.url} alt={slide.caption ?? place.name} fill sizes={sizes} className="object-cover" />
  ) : (
    <PhotoPlaceholder category={place.category} index={index} caption={sizes === "64px" ? null : slide.caption} />
  );
}

export function Gallery({ place }: { place: Place }) {
  const slides = slidesFor(place);
  const [i, setI] = useState(0);
  const current = Math.min(i, slides.length - 1);
  const go = (d: number) => setI((current + d + slides.length) % slides.length);

  return (
    <div>
      <div className="relative aspect-[16/10] max-w-full overflow-hidden rounded-[20px]">
        <SlideView place={place} slide={slides[current]} index={current} sizes="(max-width: 860px) 100vw, 420px" />
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute top-1/2 left-2.5 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#23404c] shadow"
            >
              <Icon name="back" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto siguiente"
              className="absolute top-1/2 right-2.5 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#23404c] shadow"
            >
              <Icon name="next" />
            </button>
          </>
        ) : null}
        <span className="absolute right-2.5 bottom-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-extrabold text-white tabular-nums">
          {current + 1} / {slides.length}
        </span>
      </div>
      {slides.length > 1 ? (
        <div className="mt-2.5 flex gap-2 overflow-x-auto">
          {slides.map((s, n) => (
            <button
              key={n}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Ver foto ${n + 1}`}
              aria-current={n === current}
              className={`relative h-11 w-16 flex-none overflow-hidden rounded-[10px] border-2 ${n === current ? "border-orange" : "border-transparent"}`}
            >
              <SlideView place={place} slide={s} index={n} sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
