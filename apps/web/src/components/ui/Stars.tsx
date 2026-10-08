import { formatRating } from "@/lib/format";

/** Estrellas de solo lectura con relleno parcial. */
export function Stars({ value, className = "text-sm" }: { value: number; className?: string }) {
  return (
    <span
      className={`stars ${className}`}
      style={{ "--pct": `${(value / 5) * 100}%` } as React.CSSProperties}
      role="img"
      aria-label={`${formatRating(value)} de 5 estrellas`}
    >
      <span className="bg" aria-hidden="true">
        ★★★★★
      </span>
      <span className="fg" aria-hidden="true">
        ★★★★★
      </span>
    </span>
  );
}
