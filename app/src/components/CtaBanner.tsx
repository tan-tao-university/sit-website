"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const CtaBanner = () => {
  const t = useTranslations("programs.programSlugPage.shared.ctaBanner");

  return (
    <section className="bg-white px-5 pb-16 sm:px-8 sm:pb-20 mt-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mx-auto flex max-w-7xl flex-col items-start gap-6 bg-[#BA4811] p-10 [clip-path:polygon(3%_0,100%_0,100%_82%,97%_100%,0_100%,0_18%)] sm:p-12 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h2 className="text-[1.6rem] font-bold tracking-tight text-white sm:text-[2rem]">
            {t("title")}
          </h2>
          <p className="mt-2.5 max-w-xl text-[13px] leading-relaxed text-white/80 sm:text-sm">
            {t("description")}
          </p>
        </div>
        <a
          href="https://www.facebook.com/sit.ttu.edu.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 bg-white px-7 py-3 text-sm font-semibold text-[#BA4811] transition-colors hover:bg-white/90"
        >
          {t("primary")}
          <HugeiconsIcon icon={ArrowRight02Icon} size={17} />
        </a>
      </motion.div>
    </section>
  );
};

export default CtaBanner;
