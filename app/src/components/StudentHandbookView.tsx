"use client";

import { useMemo, useState } from "react";
import YooptaRenderer from "@/components/YooptaRenderer";
import type { SiteLocale } from "@/lib/program-pages";

type YBlock = {
  id: string;
  type: string;
  value?: unknown;
  meta?: { order?: number; depth?: number };
};

type Section = { id: string; title: string; blocks: YBlock[] };

const copyByLocale = {
  vi: {
    eyebrow: "Nội dung sổ tay sinh viên",
    title: "Nội dung sổ tay",
    description: "Mở từng mục để xem chi tiết các quy định và hướng dẫn.",
    contents: "Trong sổ tay",
    empty: "Nội dung đang được cập nhật.",
  },
  en: {
    eyebrow: "Student handbook content",
    title: "Handbook contents",
    description: "Open each section to read the full guidance and regulations.",
    contents: "In this handbook",
    empty: "Content is being updated.",
  },
} as const;

// Recursively pull plain text out of a Yoopta/Slate block value.
function blockText(block: YBlock): string {
  const walk = (nodes: unknown): string => {
    if (Array.isArray(nodes)) return nodes.map(walk).join("");
    if (nodes && typeof nodes === "object") {
      const n = nodes as { text?: unknown; children?: unknown };
      if (typeof n.text === "string") return n.text;
      if (n.children) return walk(n.children);
    }
    return "";
  };
  return walk(block.value).trim();
}

// Rebuild a standalone Yoopta value from a subset of blocks, re-indexing order.
function toValue(blocks: YBlock[]): Record<string, unknown> {
  const value: Record<string, unknown> = {};
  blocks.forEach((b, index) => {
    value[b.id] = { ...b, meta: { ...(b.meta ?? {}), order: index } };
  });
  return value;
}

export default function StudentHandbookView({
  locale,
  content,
}: {
  locale: SiteLocale;
  content: Record<string, YBlock> | null | undefined;
}) {
  const copy = copyByLocale[locale];

  const { intro, sections } = useMemo(() => {
    const blocks = Object.values(content ?? {})
      .filter((b): b is YBlock => Boolean(b && b.id))
      .sort((a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0));

    const intro: YBlock[] = [];
    const sections: Section[] = [];
    for (const b of blocks) {
      if (b.type === "HeadingTwo") {
        sections.push({ id: b.id, title: blockText(b) || "—", blocks: [] });
      } else if (sections.length === 0) {
        intro.push(b);
      } else {
        sections[sections.length - 1].blocks.push(b);
      }
    }
    return { intro, sections };
  }, [content]);

  // First section open by default.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    sections[0] ? { [sections[0].id]: true } : {},
  );

  const toggle = (id: string) =>
    setExpanded((cur) => ({ ...cur, [id]: !cur[id] }));
  const open = (id: string) =>
    setExpanded((cur) => ({ ...cur, [id]: true }));

  if (sections.length === 0) {
    // No top-level headings to group by — render whatever content exists flat.
    return (
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {content && Object.keys(content).length > 0 ? (
          <YooptaRenderer value={content} />
        ) : (
          <p className="text-[#686c67]">{copy.empty}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#BA4811]">
          {copy.contents}
        </p>
        <div className="mt-5 border-t-2 border-[#171b25]">
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#handbook-section-${section.id}`}
              onClick={() => open(section.id)}
              className="grid min-h-14 grid-cols-[2.25rem_1fr] items-center border-b border-[#d4cec8] py-3 text-[0.78rem] font-semibold leading-5 text-[#5f635e] transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
            >
              <span className="font-mono text-[0.62rem] text-[#BA4811]">
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.title}
            </a>
          ))}
        </div>
      </aside>

      <div>
        <header className="grid gap-6 border-b-2 border-[#171b25] pb-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-4 text-[2.2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.9rem]">
              {copy.title}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-[#686c67]">
            {copy.description}
          </p>
        </header>

        {intro.length > 0 && (
          <div className="border-b border-[#d4cec8] py-8">
            <YooptaRenderer value={toValue(intro)} />
          </div>
        )}

        <div>
          {sections.map((section, index) => {
            const isOpen = Boolean(expanded[section.id]);
            return (
              <article
                id={`handbook-section-${section.id}`}
                key={section.id}
                className="scroll-mt-28 border-b border-[#d4cec8]"
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`handbook-panel-${section.id}`}
                    onClick={() => toggle(section.id)}
                    className="group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_2.5rem] items-center gap-4 py-7 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811] sm:grid-cols-[3.5rem_minmax(0,1fr)_3rem] sm:py-8"
                  >
                    <span className="font-mono text-[0.68rem] font-semibold text-[#BA4811]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-bold leading-7 tracking-[-0.025em] transition-colors group-hover:text-[#BA4811] sm:text-[1.35rem]">
                      {section.title}
                    </span>
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center justify-self-end border border-[#BA4811]/35 text-xl font-light leading-none text-[#BA4811] transition-colors group-hover:bg-[#BA4811] group-hover:text-white"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={`handbook-panel-${section.id}`}
                    className="pb-10 pl-[2.75rem] sm:pl-[3.5rem]"
                  >
                    {section.blocks.length > 0 ? (
                      <YooptaRenderer value={toValue(section.blocks)} />
                    ) : (
                      <p className="text-[#686c67]">{copy.empty}</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
