import { getCategory } from "@kids-place/tokens";
import Image from "next/image";
import { formatDistance, formatRating } from "@/lib/format";
import type { Place } from "@/lib/types";
import { Stars } from "../ui/Stars";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function PlaceCard({
  place,
  distanceKm,
  highlighted,
  onSelect,
  onHover,
}: {
  place: Place;
  distanceKm: number | null;
  highlighted: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const cat = getCategory(place.category);
  const cover = place.photos[0];
  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(place.id)}
      onBlur={() => onHover(null)}
      className={`grid w-full grid-cols-[76px_1fr] items-center gap-3.5 rounded-2xl p-2.5 text-left hover:bg-chip ${highlighted ? "bg-chip" : ""}`}
    >
      <div className="relative size-[76px] overflow-hidden rounded-[14px]">
        {cover ? (
          <Image src={cover.url} alt="" fill sizes="76px" className="object-cover" />
        ) : (
          <PhotoPlaceholder category={place.category} />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-base leading-tight font-extrabold">{place.name}</h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[13px] text-ink-2">
          <span className="inline-flex items-center gap-1.5 font-bold">
            <i className="size-[9px] rounded-full" style={{ background: cat.color }} />
            {cat.name}
          </span>
          <span>
            {place.zone}
            {distanceKm != null ? ` · a ${formatDistance(distanceKm)}` : ""}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[13px] tabular-nums">
          {place.ratingCount > 0 ? (
            <>
              <Stars value={place.ratingAvg} />
              <b>{formatRating(place.ratingAvg)}</b>
              <span className="text-ink-2">({place.ratingCount})</span>
            </>
          ) : (
            <span className="text-ink-2">Sin votos todavía</span>
          )}
        </div>
      </div>
    </button>
  );
}
