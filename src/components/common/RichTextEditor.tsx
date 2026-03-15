"use client";

import * as React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
}

// Toolbar button component - defined OUTSIDE the main component
interface ToolbarButtonProps {
  editor: Editor;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ElementType;
  label: string;
}

const ToolbarButton = ({
  isActive,
  onClick,
  disabled,
  icon: Icon,
  label,
}: ToolbarButtonProps) => (
  <Toggle
    size="sm"
    pressed={isActive}
    onPressedChange={onClick}
    disabled={disabled}
    aria-label={label}
    className={cn(
      "h-8 w-8 p-0",
      isActive && "bg-accent text-accent-foreground",
    )}
  >
    <Icon className="h-4 w-4" />
  </Toggle>
);

// Toolbar section wrapper - defined OUTSIDE the main component
const ToolbarSection = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-0.5">{children}</div>
);

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "Start typing...",
      disabled = false,
      className,
      minHeight = "200px",
      maxHeight = "400px",
    },
    ref,
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
      ],
      content: value,
      editable: !disabled,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
    });

    // Sync external value changes without triggering onChange
    React.useEffect(() => {
      if (editor && value !== editor.getHTML() && !editor.isDestroyed) {
        editor.commands.setContent(value, {
          emitUpdate: false,
        });
      }
    }, [value, editor]);

    if (!editor) {
      return (
        <div
          className={cn(
            "rounded-md border border-input bg-background animate-pulse",
            className,
          )}
          style={{ minHeight, maxHeight }}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col rounded-md border border-input bg-background shadow-sm",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2">
          <ToolbarSection>
            <ToolbarButton
              editor={editor}
              icon={Bold}
              label="Bold"
              isActive={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={
                disabled || !editor.can().chain().focus().toggleBold().run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={Italic}
              label="Italic"
              isActive={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={
                disabled || !editor.can().chain().focus().toggleItalic().run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={UnderlineIcon}
              label="Underline"
              isActive={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleUnderline().run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={Strikethrough}
              label="Strikethrough"
              isActive={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={
                disabled || !editor.can().chain().focus().toggleStrike().run()
              }
            />
          </ToolbarSection>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarSection>
            <ToolbarButton
              editor={editor}
              icon={Heading1}
              label="Heading 1"
              isActive={editor.isActive("heading", { level: 1 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={Heading2}
              label="Heading 2"
              isActive={editor.isActive("heading", { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={Heading3}
              label="Heading 3"
              isActive={editor.isActive("heading", { level: 3 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
              }
            />
          </ToolbarSection>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarSection>
            <ToolbarButton
              editor={editor}
              icon={AlignLeft}
              label="Align Left"
              isActive={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              disabled={disabled}
            />
            <ToolbarButton
              editor={editor}
              icon={AlignCenter}
              label="Align Center"
              isActive={editor.isActive({ textAlign: "center" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              disabled={disabled}
            />
            <ToolbarButton
              editor={editor}
              icon={AlignRight}
              label="Align Right"
              isActive={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              disabled={disabled}
            />
          </ToolbarSection>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarSection>
            <ToolbarButton
              editor={editor}
              icon={List}
              label="Bullet List"
              isActive={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleBulletList().run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={ListOrdered}
              label="Ordered List"
              isActive={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleOrderedList().run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={Quote}
              label="Quote"
              isActive={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleBlockquote().run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={Code}
              label="Code"
              isActive={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={
                disabled || !editor.can().chain().focus().toggleCode().run()
              }
            />
          </ToolbarSection>

          <div className="flex-1" />

          <ToolbarSection>
            <ToolbarButton
              editor={editor}
              icon={Undo}
              label="Undo"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={disabled || !editor.can().undo()}
            />
            <ToolbarButton
              editor={editor}
              icon={Redo}
              label="Redo"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={disabled || !editor.can().redo()}
            />
          </ToolbarSection>
        </div>

        {/* Editor Content - with prose classes for styling */}
        <div className="relative">
          <EditorContent
            editor={editor}
            className={cn(
              // Use prose classes from @tailwindcss/typography plugin
              "prose prose-sm dark:prose-invert max-w-none p-4",
              // Ensure proper styling for all elements
              "prose-headings:font-semibold prose-headings:text-foreground",
              "prose-p:text-foreground prose-p:leading-relaxed",
              "prose-strong:font-semibold prose-strong:text-foreground",
              "prose-em:italic prose-em:text-foreground",
              "prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground",
              "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-foreground",
              "prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2",
              "prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2",
              "prose-li:my-1 prose-li:text-foreground",
              // Heading sizes
              "prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-6",
              "prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-5",
              "prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4",
              // Focus states
              "[&_.ProseMirror]:min-h-[200px]",
              "[&_.ProseMirror]:focus:outline-none",
              "[&_.ProseMirror]:outline-none",
            )}
            style={{ minHeight, maxHeight, overflow: "auto" }}
          />
          {(!value || value === "<p></p>" || value === "<p><br></p>") && (
            <div className="pointer-events-none absolute left-4 top-4 text-sm text-muted-foreground">
              {placeholder}
            </div>
          )}
        </div>
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
