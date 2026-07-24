"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_NAV } from "@/lib/constants/navigation";
import { getPageTheme } from "@/lib/page-themes";

export function MobileNav() {
  const pathname = usePathname();
  const theme = getPageTheme(pathname);

  return (
    <nav
      className={`theme-${theme.key} fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-[22px] border-2 border-[#18121f] bg-[#18121f]/95 shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:hidden`}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-12 flex-col items-center gap-0.5 rounded-xl border px-2 py-1.5 text-[9px] font-black uppercase tracking-wide transition",
                active
                  ? "border-warning bg-warning text-[#18121f]"
                  : "border-transparent text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <Link
          href="/today?add=true"
          className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[9px] font-black uppercase tracking-wide text-accent"
        >
          <div className="sticker flex h-9 w-9 -rotate-3 items-center justify-center rounded-xl bg-accent text-white">
            <Plus className="h-4 w-4" />
          </div>
          Add
        </Link>
      </div>
    </nav>
  );
}
