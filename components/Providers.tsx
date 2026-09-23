"use client";

import { I18nProvider, useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { usePathname } from "next/navigation";

function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
      {t.footer}
    </footer>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChromeLess =
    pathname === "/" || pathname.startsWith("/services") || pathname.startsWith("/expert/guides");

  return (
    <I18nProvider>
      {isChromeLess ? (
        children
      ) : (
        <>
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          <SiteFooter />
        </>
      )}
    </I18nProvider>
  );
}
