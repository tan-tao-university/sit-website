"use client";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useNews } from "@/hooks/useSWR";

interface TextRibbonProps {
  messages?: string[];
  speed?: number; // pixels per second
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}

const TextRibbon = ({
  messages,
  speed = 50,
  direction = "left",
  pauseOnHover = true,
  className = "",
}: TextRibbonProps) => {
  const t = useTranslations("textRibbon");
  const defaultMessages = t.raw("messages");
  const [isPaused, setIsPaused] = useState(false);

  const { news, isLoading } = useNews();

  const newsMessages = useMemo(() => {
    if (!news || news.length === 0) return [];

    const publishedNews = news
      .filter((item) => item.status === "published" && item.publishedAt)
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt!).getTime();
        const dateB = new Date(b.publishedAt!).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    return publishedNews.map((item) => {
      const date = new Date(item.publishedAt!);
      const formattedDate = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${item.title} (${formattedDate})`;
    });
  }, [news]);

  const finalMessages =
    messages || (newsMessages.length > 0 ? newsMessages : defaultMessages);

  const duplicatedMessages = [...finalMessages, ...finalMessages];

  if (isLoading) {
    return null;
  }

  return (
    <motion.div
      className={`relative overflow-hidden bg-[#BA4811] ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="relative flex items-center py-4">
        {/* Left fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#BA4811] to-transparent z-10 pointer-events-none" />

        {/* Right fade effect */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#BA4811] to-transparent z-10 pointer-events-none" />

        {/* Scrolling content */}
        <motion.div
          className="flex items-center gap-10 whitespace-nowrap"
          animate={{
            x: direction === "left" ? "-50%" : "50%",
          }}
          transition={{
            duration: duplicatedMessages.length * (1000 / speed),
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {duplicatedMessages.map((message, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-8 text-sm font-medium text-white"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-white">
                {message}
              </span>
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TextRibbon;
