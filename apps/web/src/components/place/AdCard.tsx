"use client";

import { useEffect, useRef } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Ad } from "@/lib/types";

/** Espacio publicitario propio. Registra la impresión al verse y el clic al abrirse. */
export function AdCard({ ad }: { ad: Ad }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const supabase = getBrowserClient();
    if (!el || !supabase) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        void supabase.rpc("track_ad_event", { p_ad_id: ad.id, p_type: "impression" });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ad.id]);

  const onClick = () => {
    void getBrowserClient()?.rpc("track_ad_event", { p_ad_id: ad.id, p_type: "click" });
  };

  const body = (
    <>
      <div className="grid size-13 place-items-center overflow-hidden rounded-xl bg-[#f6d9a8] font-display text-2xl text-[#5a3a0e]">
        {ad.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          ad.advertiser.charAt(0)
        )}
      </div>
      <div className="min-w-0">
        <small className="block text-[10.5px] font-extrabold tracking-[0.12em] text-ink-2 uppercase">Publicidad</small>
        <b className="block text-[14.5px]">{ad.advertiser}</b>
        <p className="text-[13px] text-ink-2">
          {ad.title}. {ad.body}
        </p>
      </div>
    </>
  );

  const cls = "grid grid-cols-[52px_1fr] items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-line-strong p-3";
  return (
    <aside ref={ref} aria-label="Publicidad">
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noopener sponsored" onClick={onClick} className={`${cls} hover:bg-chip`}>
          {body}
        </a>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </aside>
  );
}
