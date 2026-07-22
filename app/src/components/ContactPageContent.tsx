"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, GraduationCap, BookOpen, MessageCircle } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, Call02Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import SectionTab from "@/components/SectionTab";
import { ArrowIcon } from "@/components/icons/ArrowIcon";

const ContactPageContent = () => {
  const t = useTranslations("contact");
  const tFooter = useTranslations("footer");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const address = tFooter("address");
  const phone = tFooter("phone");
  const email = tFooter("email");
  const faqHref = locale === "vi" ? `/${locale}/hoi-dap` : `/${locale}/faq`;
  const mapQuery = encodeURIComponent(address);

  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const channels = [
    {
      icon: GraduationCap,
      title: t("channelAdmissions.title"),
      desc: t("channelAdmissions.desc"),
      cta: t("channelAdmissions.cta"),
      href: "https://tuyensinh.ttu.edu.vn/",
      external: true,
    },
    {
      icon: BookOpen,
      title: t("channelAcademic.title"),
      desc: t("channelAcademic.desc"),
      cta: t("channelAcademic.cta"),
      href: `mailto:${email}`,
      external: false,
    },
    {
      icon: MessageCircle,
      title: t("channelFast.title"),
      desc: t("channelFast.desc"),
      cta: t("channelFast.cta"),
      href: "https://www.facebook.com/sit.ttu.edu.vn",
      external: true,
    },
  ];

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="relative bg-white">
        <SectionTab label={t("eyebrow")} />
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex items-center gap-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#BA4811]">
              <span className="h-px w-10 bg-current" />
              {t("eyebrow")}
            </div>
            <h1 className="max-w-[16ch] text-[2.35rem] font-bold leading-[1.06] tracking-[-0.04em] text-balance sm:text-[2.75rem] lg:text-[3.15rem]">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-[42rem] text-sm leading-7 text-[#60645f] sm:text-[0.95rem]">
              {t("lede")}
            </p>
          </motion.div>

          {/* Quick info row */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={reveal}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="border border-[#ececec] p-5">
              <Clock className="mb-3 h-5 w-5 text-[#BA4811]" strokeWidth={1.75} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8f8a]">
                {t("officeHoursLabel")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#171b25]">
                {t("officeHours")}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-[#ececec] p-5 transition-colors hover:border-[#BA4811]"
            >
              <HugeiconsIcon icon={Location01Icon} size={20} className="mb-3 text-[#BA4811]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8f8a]">
                {t("addressLabel")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#171b25]">{address}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#BA4811]">
                {t("mapCta")}
                <ArrowIcon direction="up-right" size={13} />
              </span>
            </a>
            <a
              href={`tel:${phone}`}
              className="group border border-[#ececec] p-5 transition-colors hover:border-[#BA4811]"
            >
              <HugeiconsIcon icon={Call02Icon} size={20} className="mb-3 text-[#BA4811]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8f8a]">
                {t("phoneLabel")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#171b25]">{phone}</p>
            </a>
            <a
              href={`mailto:${email}`}
              className="group border border-[#ececec] p-5 transition-colors hover:border-[#BA4811]"
            >
              <HugeiconsIcon icon={Mail01Icon} size={20} className="mb-3 text-[#BA4811]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8f8a]">
                {t("emailLabel")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#171b25]">{email}</p>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Channels */}
      <section className="bg-[#faf7f4] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={reveal}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xl font-bold tracking-tight text-[#171b25] sm:text-2xl"
          >
            {t("channelsTitle")}
          </motion.h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <motion.div
                  key={channel.title}
                  initial="hidden"
                  whileInView="visible"
                  variants={reveal}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="flex flex-col bg-white p-6"
                >
                  <Icon className="h-6 w-6 text-[#BA4811]" strokeWidth={1.75} />
                  <h3 className="mt-4 text-base font-bold text-[#171b25]">
                    {channel.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#60645f]">
                    {channel.desc}
                  </p>
                  <a
                    href={channel.href}
                    target={channel.external ? "_blank" : undefined}
                    rel={channel.external ? "noopener noreferrer" : undefined}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#BA4811] hover:text-[#96380d]"
                  >
                    {channel.cta}
                    <ArrowIcon direction="up-right" size={14} />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-7xl flex-col items-start gap-6 bg-[#BA4811] p-10 [clip-path:polygon(3%_0,100%_0,100%_82%,97%_100%,0_100%,0_18%)] sm:p-12 lg:flex-row lg:items-center lg:justify-between"
        >
          <p className="max-w-xl text-sm leading-relaxed text-white sm:text-base">
            {t("faqTeaser")}
          </p>
          <Link
            href={faqHref}
            className="inline-flex shrink-0 items-center gap-2 bg-white px-7 py-3 text-sm font-semibold text-[#BA4811] transition-colors hover:bg-white/90"
          >
            {t("faqCta")}
            <ArrowIcon direction="up-right" size={15} />
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default ContactPageContent;
