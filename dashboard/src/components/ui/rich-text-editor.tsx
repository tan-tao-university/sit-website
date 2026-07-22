"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded hover:bg-accent ${isActive ? "bg-accent" : ""}`;

  return (
    <div className="border border-border rounded-t-lg p-2 flex flex-wrap gap-1 bg-background">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 1 }))}
        type="button"
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
        type="button"
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 3 }))}
        type="button"
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
        type="button"
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
        type="button"
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={buttonClass(editor.isActive("underline"))}
        type="button"
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive("strike"))}
        type="button"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <input
        type="color"
        onInput={(e) =>
          editor
            .chain()
            .focus()
            .setColor((e.target as HTMLInputElement).value)
            .run()
        }
        value={editor.getAttributes("textStyle").color || "#000000"}
        className="w-8 h-8 rounded cursor-pointer"
        title="Text Color"
      />
      <input
        type="color"
        onInput={(e) =>
          editor
            .chain()
            .focus()
            .toggleHighlight({ color: (e.target as HTMLInputElement).value })
            .run()
        }
        className="w-8 h-8 rounded cursor-pointer"
        title="Background Color"
      />

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
        type="button"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
        type="button"
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={addLink}
        className={buttonClass(editor.isActive("link"))}
        type="button"
        title="Add Link"
      >
        <Link2 className="w-4 h-4" />
      </button>
      <button
        onClick={addImage}
        className={buttonClass(false)}
        type="button"
        title="Add Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <button
        onClick={addTable}
        className={buttonClass(editor.isActive("table"))}
        type="button"
        title="Insert Table"
      >
        <TableIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Underline.configure({}),
      TextStyle.configure({}),
      Color.configure({}),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Image.configure({}),
      Table.configure({
        resizable: true,
      }),
      TableRow.configure({}),
      TableHeader.configure({}),
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute("style"),
              renderHTML: (attributes) => {
                if (!attributes.style) {
                  return {};
                }
                return { style: attributes.style };
              },
            },
          };
        },
      }),
    ] as any,
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
        placeholder: placeholder || "",
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <Skeleton className="h-[200px] w-full rounded-lg" />;
  }

  return (
    <div className={className}>
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="border border-t-0 border-border rounded-b-lg bg-background"
      />
      <style jsx global>{`
        .tiptap {
          outline: none;
        }

        .tiptap p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .tiptap table {
          border-collapse: collapse;
          margin: 1rem 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }

        .tiptap table td,
        .tiptap table th {
          border: 1px solid #d1d5db;
          box-sizing: border-box;
          min-width: 1em;
          padding: 8px;
          position: relative;
          vertical-align: top;
          resize: vertical;
          overflow: auto;
        }

        .tiptap table th {
          background-color: #f3f4f6;
          font-weight: bold;
          text-align: left;
        }

        .tiptap table .selectedCell {
          background-color: #e0e7ff;
        }

        .tiptap img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem 0;
        }

        .tiptap a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .tiptap ul,
        .tiptap ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .tiptap h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        .tiptap h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }

        .tiptap h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }

        .tiptap h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1.12em 0;
        }

        .tiptap h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.5em 0;
        }

        .tiptap h6 {
          font-size: 0.75em;
          font-weight: bold;
          margin: 1.67em 0;
        }
      `}</style>
    </div>
  );
}
