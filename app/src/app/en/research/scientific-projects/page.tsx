"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Microscope,
  FlaskConical,
  Filter,
  Layers,
  Clock,
  Tag,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api, Research } from "@/lib/api";

type Project = {
  title: string;
  leaders: string;
  focus: string;
  summary: string;
  timeline: string;
  status: string;
  tags: string[];
};

export default function ScientificProjectsPage() {
  const t = useTranslations("researchProjects");

  const [researchProjects, setResearchProjects] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.research.findAll("PROJECT");
        setResearchProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch projects",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filters = t.raw("filters") as string[];
  const translationProjects = t.raw("projects") as Project[];
  const spotlight = t.raw("spotlight") as {
    title: string;
    description: string;
  };
  const cta = t.raw("cta") as {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };

  // Helper to translate status
  const getStatusLabel = (status?: string) => {
    if (status === "COMPLETED") {
      return t("labels.statusCompleted");
    }
    return t("labels.statusOngoing");
  };

  // Map API data to UI format
  const projects =
    researchProjects.length > 0
      ? researchProjects.map((p) => ({
          title: p.title,
          leaders: p.principalInvestigator || "N/A",
          focus: p.researchField || "N/A",
          summary: p.abstract || "",
          timeline:
            p.startYear && p.endYear ? `${p.startYear} - ${p.endYear}` : "N/A",
          status: getStatusLabel(p.status),
          tags: p.keywords ? p.keywords.split(",").map((k) => k.trim()) : [],
        }))
      : translationProjects;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Hero Section */}
      <section className="relative bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-stretch py-20">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col justify-between"
            >
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  {t("badge")}
                </span>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  {t("title")}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 border-t border-border/60 pt-5">
                {projects.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        {t("labels.totalProjects") || "Total Projects"}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {projects.length}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        {t("labels.ongoing") || "Ongoing"}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {
                          projects.filter(
                            (p) => p.status === t("labels.statusOngoing"),
                          ).length
                        }
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        {t("labels.completed") || "Completed"}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {
                          projects.filter(
                            (p) => p.status === t("labels.statusCompleted"),
                          ).length
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 lg:flex">
                <span
                  className="text-xs font-semibold uppercase tracking-[0.5em] text-muted-foreground/70"
                  style={{ writingMode: "vertical-rl" }}
                >
                  {t("badge")}
                </span>
              </div>
              <div className="relative h-full min-h-[26rem] overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-white to-muted">
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

      {/* Projects */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Filter className="h-4 w-4" />
                {t("badge")}
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {spotlight.title}
              </h2>
              <p className="max-w-2xl text-lg text-gray-600">
                {spotlight.description}
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {projects.map((project) => (
              <Card
                key={project.title}
                className="h-full border border-primary/10 bg-gradient-to-br from-white via-white to-primary/5 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-2xl w-full font-semibold text-gray-900">
                      {project.title}
                    </CardTitle>
                    <span className="rounded-full w-24 bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
                      {project.status}
                    </span>
                  </div>
                  <CardDescription className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2 text-primary/80">
                      <FlaskConical className="h-4 w-4" />
                      <span>{project.focus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Microscope className="h-4 w-4 text-primary" />
                      <span>{project.leaders}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{project.timeline}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {project.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </motion.main>
  );
}
