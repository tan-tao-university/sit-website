/**
 * Extract a PDF buffer into semantic HTML that Yoopta can deserialize.
 *
 * PDFs carry no real structure, so headings are inferred heuristically from the
 * numbering scheme used by the handbook (I. / 1. / 1.1 / A. / a)) plus font size
 * when available. It does not need to be perfect: an admin reviews and fixes the
 * result in the editor before publishing.
 *
 * ponytail: heuristic outline detection, upgrade to font-size clustering only if
 * the numbering heuristic proves too weak on future documents.
 */

type Line = { text: string; size: number };

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Roman numeral + dot at line start, e.g. "I.", "IV.", "XIV." -> top-level heading (h2).
// Only I/V/X (numerals 1-39): C/D/L/M would collide with "C." / "D." sub-list markers.
// ponytail: covers up to section XXXIX, plenty for a handbook.
const H2_RE = /^\s*[IVX]{1,6}\.\s+\S/;
// "1." / "12." / "1.1" / "1.2.3" -> sub heading (h3)
const H3_RE = /^\s*\d+(?:\.\d+)*\.?\s+\S/;
// "A." / "B." / "a)" / "b)" -> list-ish sub item, keep as h3 too when short heading-like
const ALPHA_RE = /^\s*[A-Za-z][.)]\s+\S/;
// bullet markers (require content after the marker via lookahead, but don't consume it)
const BULLET_RE = /^\s*[-•·▪o]\s+(?=\S)/;

function classify(line: Line, bodySize: number): 'h2' | 'h3' | 'li' | 'p' {
  const t = line.text.trim();
  if (H2_RE.test(t)) return 'h2';
  if (H3_RE.test(t) && t.length < 120) return 'h3';
  if (ALPHA_RE.test(t) && t.length < 120) return 'h3';
  if (BULLET_RE.test(t)) return 'li';
  // A short line noticeably larger than body text is likely a heading.
  if (bodySize > 0 && line.size > bodySize * 1.15 && t.length < 120)
    return 'h3';
  return 'p';
}

function stripBullet(t: string): string {
  return t.replace(BULLET_RE, '');
}

// A table-of-contents entry looks like "Some title ......... 42" — dotted
// leader followed by a page number. Real body headings never have this.
const TOC_LEADER_RE = /\.{4,}\s*\d+\s*$/;

/** Build HTML from ordered text lines. Exported for testing. */
export function linesToHtml(lines: Line[]): string {
  const normalized = lines.map((l) => ({
    text: l.text.replace(/\s+/g, ' ').trim(),
    size: l.size,
  }));

  // Everything up to and including the LAST table-of-contents entry is front
  // matter (cover page + "Mục lục" heading + the TOC itself). Drop it so the
  // content starts at the first real section. Documents without a dotted TOC
  // keep all their lines.
  let start = 0;
  for (let i = normalized.length - 1; i >= 0; i--) {
    if (TOC_LEADER_RE.test(normalized[i].text)) {
      start = i + 1;
      break;
    }
  }

  const clean = normalized
    .slice(start)
    .map((l) => ({
      // Collapse any stray leader dots that survived into readable spacing.
      text: l.text
        .replace(/\.{4,}/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
      size: l.size,
    }))
    // Drop empty lines and standalone page numbers (a line that is only digits).
    .filter((l) => l.text.length > 0 && !/^\d{1,3}$/.test(l.text));

  if (clean.length === 0) return '<p></p>';

  // Body font size = most common size, used as the heading threshold baseline.
  const freq = new Map<number, number>();
  for (const l of clean) freq.set(l.size, (freq.get(l.size) ?? 0) + 1);
  let bodySize = 0;
  let best = -1;
  for (const [size, count] of freq) {
    if (count > best) {
      best = count;
      bodySize = size;
    }
  }

  const parts: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      parts.push('</ul>');
      inList = false;
    }
  };

  for (const line of clean) {
    const kind = classify(line, bodySize);
    if (kind === 'li') {
      if (!inList) {
        parts.push('<ul>');
        inList = true;
      }
      parts.push(`<li>${escapeHtml(stripBullet(line.text))}</li>`);
      continue;
    }
    closeList();
    if (kind === 'h2') parts.push(`<h2>${escapeHtml(line.text)}</h2>`);
    else if (kind === 'h3') parts.push(`<h3>${escapeHtml(line.text)}</h3>`);
    else parts.push(`<p>${escapeHtml(line.text)}</p>`);
  }
  closeList();

  return parts.join('\n');
}

// unpdf re-exports pdf.js's proxy types in a way `nodenext` module resolution
// can't follow through the dynamic import below — pin down the shape we
// actually use instead of letting it fall back to an unresolvable type.
interface PdfTextItem {
  str?: string;
  transform: number[]; // [a,b,c,d,e,f]
}
interface PdfDocumentProxy {
  numPages: number;
  getPage(pageNum: number): Promise<{
    getTextContent(): Promise<{ items: PdfTextItem[] }>;
  }>;
}

/** Parse a PDF buffer and return semantic HTML. */
export async function pdfBufferToHtml(buffer: Buffer): Promise<string> {
  // unpdf ships a serverless build of pdf.js (no native deps) — safe on Vercel.
  const { getDocumentProxy } = await import('unpdf');
  const pdf = (await getDocumentProxy(
    new Uint8Array(buffer),
  )) as PdfDocumentProxy;

  const lines: Line[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Group text items into visual lines by their vertical (y) position.
    const rows = new Map<
      number,
      { items: { x: number; str: string }[]; size: number }
    >();
    for (const item of content.items) {
      const str: string = item.str ?? '';
      if (!str) continue;
      const tr = item.transform;
      const x = tr[4];
      const y = Math.round(tr[5]); // round so items on the same line share a key
      const size = Math.abs(tr[3]) || Math.abs(tr[0]) || 0;
      const row = rows.get(y) ?? { items: [], size };
      row.items.push({ x, str });
      row.size = Math.max(row.size, size);
      rows.set(y, row);
    }

    // pdf.js y grows upward, so sort rows top-to-bottom = descending y.
    const sortedY = [...rows.keys()].sort((a, b) => b - a);
    for (const y of sortedY) {
      const row = rows.get(y)!;
      const text = row.items
        .sort((a, b) => a.x - b.x)
        .map((i) => i.str)
        .join('')
        .trim();
      if (text) lines.push({ text, size: row.size });
    }
  }

  return linesToHtml(lines);
}
