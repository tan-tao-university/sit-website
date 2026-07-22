import type { Metadata } from "next";
import { Be_Vietnam_Pro, Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const dashboardFont = Be_Vietnam_Pro({
  variable: "--font-dashboard",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
  description:
    'Khoa Công nghệ Thông tin Đại học Tân Tạo áp dụng triết lí "Khai phóng - học suốt đời" với chương trình tham chiếu từ Đại học Duke (Hoa Kỳ), đồng hành cùng chuyển đổi số.',
  keywords:
    "Khoa Công nghệ Thông tin, Đại học Tân Tạo, Tan Tao University, SIT, School of Information Technology, IT, Computer Science, Đào tạo, Giáo dục, Công nghệ 4.0",
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
    url: "https://sit.ttu.edu.vn",
    siteName: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
    title: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
    description:
      'Khoa Công nghệ Thông tin Đại học Tân Tạo áp dụng triết lí "Khai phóng - học suốt đời" với chương trình tham chiếu từ Đại học Duke (Hoa Kỳ), đồng hành cùng chuyển đổi số.',
    images: ["/assets/logo-sit.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
    description:
      'Khoa Công nghệ Thông tin Đại học Tân Tạo áp dụng triết lí "Khai phóng - học suốt đời" với chương trình tham chiếu từ Đại học Duke (Hoa Kỳ), đồng hành cùng chuyển đổi số.',
    images: ["/assets/logo-sit.png"],
  },
  alternates: {
    canonical: "https://sit.ttu.edu.vn",
    languages: {
      "vi-VN": "https://sit.ttu.edu.vn",
      "en-US": "https://sit.ttu.edu.vn/?lang=en",
    },
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
  manifest: "/assets/logo-sit.png",
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${dashboardFont.className} ${dashboardFont.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
