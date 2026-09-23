import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_KR, Noto_Sans_SC } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-kr",
  subsets: ["latin"],
});

const notoSansSc = Noto_Sans_SC({
  variable: "--font-sc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VLaw — Emergency legal aid",
  description:
    "Emergency SOS intake, live case tracking, and an encrypted document vault for migrant workers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSans.variable} ${notoSansKr.variable} ${notoSansSc.variable} h-full scroll-smooth`}
    >
      <body className="flex min-h-full flex-col bg-[#F4F1EA] text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
