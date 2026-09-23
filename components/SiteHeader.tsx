"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, type Locale } from "@/lib/i18n";

const locales: Locale[] = ["ko", "zh", "en"];

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();

  const links = [
    { href: "/", label: t.home },
    { href: "/sos", label: t.sos },
    { href: "/tracking", label: t.tracking },
    { href: "/vault", label: t.vault },
    { href: "/expert/dashboard", label: t.expert },
  ];

  return (
    <header className="border-b border-white/10 bg-[#0B1F3A] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight">{t.brand}</span>
            <span className="hidden text-xs text-white/70 sm:inline">{t.tagline}</span>
          </Link>
        </div>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 ${
                  active ? "bg-white text-[#0B1F3A]" : "text-white/80 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex gap-1" role="group" aria-label="Language">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                locale === code ? "bg-[#C9A227] text-[#0B1F3A]" : "bg-white/10"
              }`}
            >
              {code === "ko" ? t.langKo : code === "zh" ? t.langZh : t.langEn}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
