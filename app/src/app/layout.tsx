import type { Metadata } from "next";
import { Roboto_Mono, Be_Vietnam_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, absoluteUrl, truncateText } from "@/lib/seo";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "SIT - Đại học Tân Tạo",
  title: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
  description:
    "Khoa Công nghệ Thông tin Đại học Tân Tạo đào tạo Khoa học Máy tính, Khoa học Dữ liệu, Trí tuệ nhân tạo và Công nghệ thông tin gắn với thực hành, nghiên cứu.",
  keywords:
    "Khoa Công nghệ Thông tin Đại học Tân Tạo, Khoa học Máy tính, Khoa học Dữ liệu, Trí tuệ nhân tạo, Công nghệ thông tin, SIT, TTU",
  authors: [{ name: "Khoa Công nghệ Thông tin - Đại học Tân Tạo" }],
  creator: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
  publisher: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
    title: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
    description: truncateText(
      "Khoa Công nghệ Thông tin Đại học Tân Tạo đào tạo Khoa học Máy tính, Khoa học Dữ liệu, Trí tuệ nhân tạo và Công nghệ thông tin gắn với thực hành, nghiên cứu.",
      125,
    ),
    images: [
      {
        url: absoluteUrl("/assets/logo-sit.png"),
        width: 1200,
        height: 1200,
        alt: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
    description:
      "Đào tạo Công nghệ Thông tin, Khoa học Máy tính, Khoa học Dữ liệu và Trí tuệ nhân tạo tại Đại học Tân Tạo.",
    images: [absoluteUrl("/assets/logo-sit.png")],
  },
  icons: {
    icon: [
      {
        url: "/assets/logo-sit.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/assets/logo-sit.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/assets/logo-sit.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  category: "education",
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        suppressHydrationWarning
        className={`${beVietnamPro.className} ${robotoMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
