/* eslint-disable @next/next/no-img-element -- SVG de marca servidos tal cual desde /public */

/** Logotipo con versión para modo oscuro (el azul de "KIDS" pierde contraste sobre fondo oscuro). */
export function Logotype({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <picture>
      <source srcSet="/brand/kids-place-logotipo-oscuro.svg" media="(prefers-color-scheme: dark)" />
      <img src="/brand/kids-place-logotipo.svg" alt="Kids·Place" className={className} width={864} height={217} />
    </picture>
  );
}

export function Face({ className = "w-24" }: { className?: string }) {
  return <img src="/brand/kids-place-carita.svg" alt="" className={className} width={582} height={468} />;
}
