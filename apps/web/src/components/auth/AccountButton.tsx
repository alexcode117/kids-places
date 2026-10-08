"use client";

import { useAuth } from "./AuthProvider";

export function AccountButton() {
  const { user, ready, requestLogin, signOut } = useAuth();

  if (!ready) return <div className="h-9 w-28" aria-hidden="true" />;

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => requestLogin()}
        className="rounded-full bg-blue px-4 py-2 text-sm font-extrabold whitespace-nowrap text-white"
      >
        Iniciar sesión
      </button>
    );
  }

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-2">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className="size-9 rounded-full" referrerPolicy="no-referrer" />
      ) : (
        <span className="grid size-9 place-items-center rounded-full bg-teal text-[13px] font-extrabold text-[#1f3c47]" aria-hidden="true">
          {initials}
        </span>
      )}
      <span className="hidden text-[13px] leading-tight text-ink-2 lg:block">
        Hola,
        <b className="block text-sm text-ink">{user.name}</b>
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-full border-[1.5px] border-line-strong px-3 py-1.5 text-sm font-extrabold whitespace-nowrap hover:bg-chip"
      >
        Salir
      </button>
    </div>
  );
}
