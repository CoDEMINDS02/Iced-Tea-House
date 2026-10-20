"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { allNavItems } from "@/lib/navigation";

type TopbarProps = {
  /** Called when the mobile menu button is pressed. */
  onMenuClick: () => void;
};

function getPageTitle(pathname: string) {
  if (pathname === "/") return "Dashboard";

  const matches = allNavItems.filter(
    (item) =>
      item.href !== "/" &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );

  // The most specific link wins: "/orders/new" beats "/orders".
  const best = matches.sort((a, b) => b.href.length - a.href.length)[0];

  return best ? best.label : "Iced Tea House";
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      {/* Mobile menu button: hidden on large screens */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>

      {/* Demo user and sign out */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-medium text-neutral-900">Demo Admin</p>
          <p className="text-xs text-neutral-500">Demo account</p>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
          aria-hidden="true"
        >
          DA
        </div>
        <Link
          href="/login"
          title="Sign out"
          className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Sign out</span>
          <span className="sr-only md:hidden">Sign out</span>
        </Link>
      </div>
    </header>
  );
}