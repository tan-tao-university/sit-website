"use client";

import YooptaEditor, {
  createYooptaEditor,
  YooptaContentValue,
} from "@yoopta/editor";
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
  value?: YooptaContentValue;
  className?: string;
};

export function YooptaRenderer({ value, className }: Props) {
  const editor = useMemo(() => createYooptaEditor(), []);

  if (!value || Object.keys(value).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có nội dung chi tiết.
      </p>
    );
  }

  return (
    <div
      className={`yoopta-editor-readonly prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-stone-950 [&_h1]:border-b [&_h1]:border-[#eee9e4] [&_h1]:pb-2 [&_h1]:mt-10 [&_h1]:text-3xl [&_h2]:mt-8 [&_h2]:text-2xl [&_h3]:text-xl [&_p]:text-stone-600 [&_p]:leading-7 break-normal ${className || ""}`}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins as any}
        marks={MARKS}
        value={value}
        readOnly
        style={{ width: "100%" }}
      />
    </div>
  );
}
