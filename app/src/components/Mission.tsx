"use client";

import { Target, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

const Mission = () => {
  const t = useTranslations("about");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="bg-white">
      <div className="w-full px-3 sm:px-6 lg:px-10 py-10 sm:py-14 pt-16 sm:pt-20 container flex flex-col gap-8 sm:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-left mb-6 sm:mb-8 flex flex-col gap-5"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-snug"
          >
            {t("mission")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-base sm:text-2xl text-muted-foreground leading-relaxed max-w-[95vw] text-left"
          >
            {t("missionText").replace(/\u00a0/g, " ")}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Link
            href={`/${locale}/about`}
            className="w-full flex justify-center"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto px-6 sm:px-16 lg:px-20 py-4 sm:py-5 bg-[#BA4811] hover:bg-[#BA4811]/80 text-white font-semibold text-base sm:text-xl transition-all duration-300 group cursor-pointer"
            >
              {t("explorePrograms")}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Mission;
