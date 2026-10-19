"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CupSoda } from "lucide-react";
import { navSections } from "@/lib/navigation";

type SidebarProps = {
  /** Called after a link is clicked. The mobile drawer uses this to close itself. */
  onNavigate?: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <CupSoda className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-neutral-900">Iced Tea House</p>
          <p className="text-xs text-neutral-500">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] ${
                          active ? "text-brand-600" : "text-neutral-400"
                        }`}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Demo label */}
      <div className="shrink-0 border-t border-neutral-200 p-4">
        <div className="rounded-lg bg-brand-50 px-3 py-2">
          <p className="text-xs font-medium text-brand-800">Demo mode</p>
          <p className="text-xs text-brand-700">Using sample data only</p>
        </div>
      </div>
    </div>
  );
}