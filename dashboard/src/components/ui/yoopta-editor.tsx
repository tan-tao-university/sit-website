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
import ActionMenu, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import { html } from "@yoopta/exports";
import { useMemo, useEffect, useRef } from "react";
import { api } from "@/lib/api";

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
  Embed,
  Image.extend({
    options: {
      async onUpload(file) {
        try {
          const res = await api.upload.image(file, "editor");
          return {
            src: res.url,
            alt: file.name,
            sizes: {
              width: 0,
              height: 0,
            },
          };
        } catch (error) {
          console.error("Upload failed", error);
          // Return valid image structure even on failure to prevent editor crash? No, throw usually.
          throw error;
        }
      },
    },
  }),
  Video,
  Link,
  Accordion,
];

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

type Props = {
  value?: YooptaContentValue;
  onChange: (value: YooptaContentValue) => void;
  readOnly?: boolean;
  className?: string;
  /**
   * When set to a new non-empty HTML string, it is deserialized into the editor
   * (used to import extracted PDF content). Re-importing the same string is a no-op.
   */
  seedHtml?: string;
};

export function YooptaEditorComponent({
  value,
  onChange,
  readOnly,
  className,
  seedHtml,
}: Props) {
  const editor = useMemo(() => createYooptaEditor(), []);
  const lastSeedRef = useRef<string | undefined>(undefined);

  // ponytail: Yoopta's own paste handler only reads `text/html`. macOS apps put an
  // <img> HTML flavor on the pasteboard alongside the bitmap, so Cmd+V works there;
  // Windows screenshot tools (Snipping Tool, PrtScn) put a raw bitmap only, which
  // arrives as clipboardData.files and Yoopta ignores it. Upload those ourselves.
  const handlePasteCapture = async (event: React.ClipboardEvent) => {
    if (readOnly) return;
    const images = Array.from(event.clipboardData.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (images.length === 0) return;

    event.preventDefault();
    event.stopPropagation();

    let at = editor.path.current ?? undefined;
    for (const file of images) {
      try {
        const { url } = await api.upload.image(file, "editor");
        editor.commands.insertImage({
          at,
          focus: true,
          props: {
            src: url,
            alt: file.name,
            sizes: { width: 650, height: 500 },
          },
        });
        if (at !== undefined) at += 1;
      } catch (error) {
        console.error("Failed to upload pasted image", error);
      }
    }
  };

  useEffect(() => {
    if (!seedHtml || seedHtml === lastSeedRef.current) return;
    lastSeedRef.current = seedHtml;
    try {
      const imported = html.deserialize(editor, seedHtml);
      editor.setEditorValue(imported);
      onChange(imported);
    } catch (error) {
      console.error("Failed to import HTML into editor", error);
    }
  }, [seedHtml, editor, onChange]);

  return (
    // ponytail: pl-12 reserves the 46px strip Yoopta draws the ⊕/drag buttons in
    // (left: blockRect.left, translateX(-46px)) so they land inside the card
    // instead of over the page background, where they were near-invisible.
    <div
      className={`yoopta-editor-container pl-12 ${className || ""}`}
      onPasteCapture={handlePasteCapture}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins as any}
        marks={MARKS}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder="Start typing..."
        tools={{
          ActionMenu: {
            render: DefaultActionMenuRender,
            tool: ActionMenu,
          },
          Toolbar: {
            render: DefaultToolbarRender,
            tool: Toolbar,
          },
        }}
        style={{
          width: "100%",
        }}
      />
    </div>
  );
}
