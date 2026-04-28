"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { HeroQuote } from "@/components/layout/hero-quote";

export function DashboardHero() {
  const pathname = usePathname();

  if (pathname.startsWith("/mentee/exams")) {
    return null;
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="px-4 py-2 md:px-6">
        <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          <div className="relative">
            <Image
              src="/dashboard-hero.svg"
              alt="Dashboard hero banner"
              width={1200}
              height={260}
              className="h-[132px] w-full object-cover md:h-[148px]"
              priority
            />
            <div className="absolute inset-0 bg-slate-900/35" />
            <div className="absolute inset-0 flex items-end p-4 md:p-6">
              <HeroQuote />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
