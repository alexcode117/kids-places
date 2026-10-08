"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../ui/Icon";
import { useAuth } from "./AuthProvider";

export function AccountButton() {
  const { user, ready, requestLogin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  if (!ready) return <div className="h-10 w-10 desktop:w-28" aria-hidden="true" />;

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => requestLogin()}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-blue px-4 py-2 text-sm font-extrabold whitespace-nowrap text-white"
      >
        <Icon name="user" className="size-4 desktop:hidden" />
        <span className="desktop:hidden">Entrar</span>
        <span className="mobile:hidden">Iniciar sesión</span>
      </button>
    );
  }

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const avatar = user.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.avatarUrl} alt="" className="size-10 rounded-full" referrerPolicy="no-referrer" />
  ) : (
    <span className="grid size-10 place-items-center rounded-full bg-teal text-[13px] font-extrabold text-[#1f3c47]" aria-hidden="true">
      {initials}
    </span>
  );

  return (
    <div ref={menuRef} className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-label={`Tu cuenta: ${user.name}`}
        className="flex items-center gap-2 rounded-full"
      >
        {avatar}
        <span className="hidden text-left text-[13px] leading-tight text-ink-2 lg:block">
          Hola,
          <b className="block text-sm text-ink">{user.name}</b>
        </span>
      </button>
      {menuOpen ? (
        <div className="absolute top-12 right-0 z-40 w-56 rounded-2xl border border-line bg-surface p-2 shadow-soft">
          <p className="truncate px-3 pt-1.5 pb-2 text-sm">
            <b className="block truncate">{user.name}</b>
            {user.email ? <span className="block truncate text-xs text-ink-2">{user.email}</span> : null}
          </p>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              void signOut();
            }}
            className="w-full rounded-xl px-3 py-2.5 text-left font-extrabold hover:bg-chip"
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}
