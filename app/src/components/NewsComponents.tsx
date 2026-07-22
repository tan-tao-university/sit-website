"use client";

import { motion } from "framer-motion";
import { Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memo } from "react";
import { cn } from "@/utils/cn";

interface NewsCardProps {
  item: {
    title: string;
    date: string;
    category: string;
    summary: string;
    image?: string;
    slug?: string;
  };
  index: number;
  isActive: boolean;
  locale: string;
  t: (key: string) => string;
}

/**
 * Memoized News Card Component
 * Prevents unnecessary re-renders when scroll position changes
 */
export const NewsCard = memo(function NewsCard({
  item,
  index,
  isActive,
  locale,
  t,
}: NewsCardProps) {
  return (
    <motion.div
      key={`card-${item.title}-${item.date}`}
      className={cn(
        "transition-all duration-500",
        isActive ? "opacity-100" : "opacity-60",
      )}
      animate={{
        scale: isActive ? 1 : 0.95,
        y: isActive ? 0 : 20,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <motion.article
        className={cn(
          "group relative overflow-hidden rounded-3xl border transition-all duration-500",
          isActive
            ? "border-primary bg-white shadow-2xl"
            : "border-border bg-white/80 shadow-lg hover:shadow-xl",
        )}
        whileHover={{
          y: -8,
          transition: { duration: 0.3 },
        }}
      >
        {/* Image */}
        <div className="relative h-64 w-full overflow-hidden">
          {item.image ? (
            <>
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/55" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-200" />
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 z-10">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                isActive ? "bg-primary text-white" : "bg-white/90 text-primary",
              )}
            >
              {item.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {item.date}
          </div>

          <h3
            className={cn(
              "text-2xl font-bold leading-tight group-hover:text-primary transition-colors",
              isActive ? "text-foreground" : "text-foreground/90",
            )}
          >
            {item.title}
          </h3>

          <p
            className={cn(
              "text-muted-foreground leading-relaxed",
              isActive ? "text-muted-foreground" : "text-muted-foreground/80",
            )}
          >
            {item.summary.slice(0, 160) + "..."}
          </p>

          <Button
            variant="outline"
            className={cn(
              "w-fit group/link transition-all",
              isActive
                ? "border-primary text-primary hover:bg-primary hover:text-white"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary",
            )}
            asChild
          >
            <a
              href={item.slug ? `/${locale}/news/${item.slug}` : "#"}
              className="inline-flex items-center gap-2"
            >
              {t("viewDetails")}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
            </a>
          </Button>
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute inset-0 border-2 border-primary rounded-3xl pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.article>
    </motion.div>
  );
});

interface NewsTitleItemProps {
  item: {
    title: string;
    date: string;
    category: string;
  };
  index: number;
  isActive: boolean;
}

/**
 * Memoized News Title Item Component
 * Used in the left column of the news section
 */
export const NewsTitleItem = memo(function NewsTitleItem({
  item,
  index,
  isActive,
}: NewsTitleItemProps) {
  return (
    <motion.div
      key={`title-${item.title}-${item.date}`}
      className={cn(
        "transition-all duration-500 cursor-pointer",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
      animate={{
        scale: isActive ? 1.05 : 1,
        opacity: isActive ? 1 : 0.6,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-sm">
          <span
            className={cn(
              "font-semibold uppercase tracking-wide",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.category}
          </span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span className="text-muted-foreground">{item.date}</span>
        </div>
        <h3
          className={cn(
            "text-2xl lg:text-3xl font-bold leading-tight transition-colors",
            isActive ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {item.title}
        </h3>
        {isActive && (
          <motion.div
            className="h-1 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        )}
      </div>
    </motion.div>
  );
});
