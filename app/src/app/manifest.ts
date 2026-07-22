import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
    short_name: "SIT - TTU",
    description:
      "Website chính thức của Khoa Công nghệ Thông tin, Đại học Tân Tạo.",
    start_url: "/vi",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ba4811",
    lang: "vi",
    icons: [
      {
        src: "/assets/logo-sit.png",
        sizes: "1875x1875",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
