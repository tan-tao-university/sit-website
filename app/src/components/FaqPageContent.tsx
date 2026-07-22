"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import SectionTab from "@/components/SectionTab";
import { ArrowIcon } from "@/components/icons/ArrowIcon";

type FaqItem = { q: string; a: string };

const FaqPageContent = () => {
  const t = useTranslations("faq");
  const tHeader = useTranslations("header");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const items = t.raw("items") as FaqItem[];
  const contactHref = locale === "vi" ? `/${locale}/lien-he` : `/${locale}/contact`;

  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="relative bg-white">
        <SectionTab label={t("eyebrow")} />
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 lg:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center gap-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#BA4811]">
              <span className="h-px w-10 bg-current" />
              {t("eyebrow")}
            </div>
            <h1 className="text-[2.35rem] font-bold leading-[1.06] tracking-[-0.04em] text-balance sm:text-[2.75rem]">
              {t("title")}
            </h1>
            <p className="mt-6 text-sm leading-7 text-[#60645f] sm:text-[0.95rem]">
              {t("lede")}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={reveal}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10"
          >
            <Accordion.Root type="single" collapsible className="border-t border-[#ececec]">
              {items.map((item, index) => (
                <Accordion.Item
                  key={item.q}
                  value={`item-${index}`}
                  className="border-b border-[#ececec]"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-semibold text-[#171b25] transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]">
                      {item.q}
                      <ChevronDown
                        className="h-4 w-4 shrink-0 text-[#8d8f8a] transition-transform duration-300 group-hover:text-[#BA4811] group-data-[state=open]:rotate-180"
                        strokeWidth={2}
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden text-sm leading-relaxed text-[#60645f] data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <p className="pb-5 pr-8">{item.a}</p>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-3xl flex-col items-start gap-6 bg-[#BA4811] p-10 [clip-path:polygon(3%_0,100%_0,100%_82%,97%_100%,0_100%,0_18%)] sm:flex-row sm:items-center sm:justify-between sm:p-12"
        >
          <h2 className="text-lg font-bold text-white sm:text-xl">
            {t("contactCta")}
          </h2>
          <Link
            href={contactHref}
            className="inline-flex shrink-0 items-center gap-2 bg-white px-7 py-3 text-sm font-semibold text-[#BA4811] transition-colors hover:bg-white/90"
          >
            {tHeader("contactLink")}
            <ArrowIcon direction="up-right" size={15} />
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default FaqPageContent;
