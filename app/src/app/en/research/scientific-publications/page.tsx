"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Library,
  Globe,
  FileText,
  ScrollText,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api, Research } from "@/lib/api";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons/ArrowIcon";

type SectionItem = {
  title: string;
  authors: string;
  where: string;
  linkLabel: string;
};

type Section = {
  title: string;
  items: SectionItem[];
};

export default function ScientificPublicationsPage() {
  const t = useTranslations("researchPublications");

  const [researchPublications, setResearchPublications] = useState<Research[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const data = await api.research.findAll("PUBLICATION");
        setResearchPublications(data);
      } catch (err) {
        console.error("Failed to fetch publications:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch publications",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const cta = t.raw("cta") as {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };

  // Calculate metrics from real data
  const metrics = researchPublications.length > 0 && [
    {
      value: researchPublications.length.toString(),
      label: t("labels.totalPublications"),
    },
    {
      value: researchPublications
        .filter((p) => p.publicationYear === new Date().getFullYear())
        .length.toString(),
      label: t("labels.thisYear"),
    },
    {
      value: new Set(
        researchPublications.map((p) => p.journalName).filter(Boolean),
      ).size.toString(),
      label: t("labels.journals"),
    },
  ];

  const sections = researchPublications.length > 0 && [
    {
      title: "Recent Publications",
      items: researchPublications.slice(0, 10).map((p) => ({
        title: p.title,
        authors: p.authors || "N/A",
        where: p.journalName || p.publisher || "N/A",
        linkLabel: p.doi ? "View DOI" : "View Details",
      })),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-sm sm:text-lg text-muted-foreground">Loading publications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-6">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-destructive text-lg sm:text-xl">Error loading data</CardTitle>
            <CardDescription className="text-sm">
              Unable to load publications. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <p className="text-xs sm:text-sm text-muted-foreground bg-destructive/10 p-3 rounded-md break-words">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary/90 touch-manipulation min-h-[44px]"
            >
              Reload page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Hero Section */}
      <section className="relative bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-stretch py-10 sm:py-14 lg:py-20">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col justify-between order-1"
            >
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.25em] lg:tracking-[0.3em] text-primary">
                  {t("badge")}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  {t("title")}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              <div className="mt-6 sm:mt-8 grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 border-t border-border/60 pt-4 sm:pt-5">
                {metrics &&
                  metrics?.map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground">
                        {metric.label}
                      </p>
                      {metric.value && (
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">
                          {metric.value}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative order-2 lg:order-none"
            >
              <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 lg:flex">
                <span
                  className="text-xs font-semibold uppercase tracking-[0.5em] text-muted-foreground/70"
                  style={{ writingMode: "vertical-rl" }}
                >
                  {t("badge")}
                </span>
              </div>
              <div className="relative h-full min-h-[14rem] sm:min-h-[20rem] lg:min-h-[26rem] overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-white to-muted">
                <Image
                  src="/assets/meeting.png"
                  alt="Research collaboration"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Publications */}
      <section className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8 sm:space-y-12">
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-wider text-primary">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                {t("badge")}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t("labels.recentPublications")}
              </h2>
              <p className="max-w-2xl text-sm sm:text-base lg:text-lg text-gray-600">{t("subtitle")}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {researchPublications &&
              researchPublications.map((item) => (
                <Card
                  key={item.id}
                  className="h-full border border-[#ef8c5a] bg-white transition-transform duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 line-clamp-2 sm:line-clamp-none">
                      {item.title}
                    </CardTitle>
                    <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-2 text-primary/80 min-w-0">
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">{item.authors}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Library className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
                        <span className="truncate">{item.journalName || item.publisher}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <Link
                      href={item.pdfUrl || ""}
                      target="_blank"
                      className="inline-flex cursor-pointer items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors touch-manipulation py-1"
                    >
                      View details
                      <ArrowIcon direction="up-right" size={16} />
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>
    </motion.main>
  );
}
