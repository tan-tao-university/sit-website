
"use client";

import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";
import Paragraph from "@yoopta/paragraph";
import Blockquote from "@yoopta/blockquote";
import Embed from "@yoopta/embed";
import Image from "@yoopta/image";
import Link from "@yoopta/link";
import Callout from "@yoopta/callout";
import Video from "@yoopta/video";
import Accordion from "@yoopta/accordion";
import { HeadingOne, HeadingTwo, HeadingThree } from "@yoopta/headings";
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";
import {
  Bold,
  Italic,
  CodeMark,
  Underline,
  Strike,
  Highlight,
} from "@yoopta/marks";
import { useMemo } from "react";

const normalizeWhitespace = (obj: any): any => {
  if (typeof obj === "string") {
    return obj.replace(/[ \t\v\f\r\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/g, " ");
  }
  if (Array.isArray(obj)) {
    return obj.map(normalizeWhitespace);
  }
  if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = normalizeWhitespace(obj[key]);
    }
    return newObj;
  }
  return obj;
};

const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  Callout,
  NumberedList,
  BulletedList,
  TodoList,
  Embed,
  Image,
  Video,
  Link,
  Accordion,
];

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

type Props = {
  value: Record<string, any>;
  className?: string;
};

export default function YooptaRenderer({ value, className }: Props) {
  const editor = useMemo(() => createYooptaEditor(), []);
  const normalizedValue = useMemo(() => normalizeWhitespace(value), [value]);

  return (
    <div
      className={`yoopta-editor-readonly prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 [&_h1]:border-b [&_h1]:border-gray-200 [&_h1]:pb-2 [&_h1]:mt-10 [&_h1]:text-3xl [&_h2]:mt-8 [&_h2]:text-2xl [&_h3]:text-xl [&_p]:text-gray-600 [&_p]:leading-7 break-normal ${className || ""
        }`}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins as any}
        marks={MARKS}
        value={normalizedValue}
        readOnly
        style={{ width: "100%" }}
      />
    </div>
  );
}
