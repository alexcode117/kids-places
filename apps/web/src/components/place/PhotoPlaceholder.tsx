import { ICONS, getCategory, type CategorySlug } from "@kids-place/tokens";

/** Ilustración usada mientras un sitio no tiene fotos reales. */
export function PhotoPlaceholder({
  category,
  index = 0,
  caption,
}: {
  category: CategorySlug;
  index?: number;
  caption?: string | null;
}) {
  const { color } = getCategory(category);
  const sunX = 60 + ((index * 83) % 200);
  const hill = 120 + ((index * 17) % 30);
  const flip = index % 2 === 1;
  return (
    <div className="absolute inset-0 bg-[var(--ph-base)]">
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="block size-full" aria-hidden="true">
        <rect width="320" height="200" fill={color} opacity={0.16} />
        <circle cx={sunX} cy={52 + index * 6} r={22} fill="#f4a546" opacity={0.85} />
        <path
          d={`M0 ${hill} C${flip ? 90 : 60} ${hill - 40} ${flip ? 170 : 140} ${hill - 30} 220 ${hill - 6} S300 ${hill - 34} 320 ${hill - 20} V200 H0Z`}
          fill={color}
          opacity={0.35}
        />
        <path
          d={`M0 ${hill + 30} C80 ${hill + 6} 160 ${hill + 40} 230 ${hill + 22} S300 ${hill + 8} 320 ${hill + 18} V200 H0Z`}
          fill={color}
          opacity={0.7}
        />
        <g
          transform={`translate(${flip ? 200 : 96} ${hill - 8}) scale(2.4)`}
          fill="none"
          stroke="#fff"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ICONS[category]} />
        </g>
      </svg>
      {caption ? (
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold text-white">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
