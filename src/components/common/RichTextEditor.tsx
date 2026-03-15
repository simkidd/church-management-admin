"use client";

import * as React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ListTodo,
  Quote,
  Code,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Palette,
  RemoveFormatting,
  Minus,
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

// Toolbar button component
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

// Toolbar section wrapper
const ToolbarSection = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-0.5">{children}</div>
);

// Link input popover component
const LinkPopover = ({
  editor,
  disabled,
}: {
  editor: Editor;
  disabled?: boolean;
}) => {
  const [url, setUrl] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const addLink = () => {
    if (url) {
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setUrl("");
    setIsOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setUrl("");
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      const previousUrl = editor.getAttributes("link").href;
      setUrl(previousUrl || "");
    }
  }, [isOpen, editor]);

  if (isOpen) {
    return (
      <div className="flex items-center gap-2 p-2 bg-popover border rounded-md shadow-md absolute z-50 mt-8">
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-48 h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") addLink();
            if (e.key === "Escape") setIsOpen(false);
          }}
        />
        <Button size="sm" onClick={addLink} disabled={disabled}>
          Add
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={removeLink}
          disabled={disabled}
        >
          Remove
        </Button>
      </div>
    );
  }

  return (
    <ToolbarButton
      editor={editor}
      icon={LinkIcon}
      label="Link"
      isActive={editor.isActive("link")}
      onClick={() => setIsOpen(true)}
      disabled={disabled}
    />
  );
};

// Color picker component
const ColorPicker = ({
  editor,
  disabled,
}: {
  editor: Editor;
  disabled?: boolean;
}) => {
  const colors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#cccccc",
    "#ffffff",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];

  const [isOpen, setIsOpen] = React.useState(false);

  const setColor = (color: string) => {
    if (color === "default") {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <div className="absolute z-50 mt-8 p-2 bg-popover border rounded-md shadow-md">
        <div className="grid grid-cols-7 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setColor(color)}
              className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
          <button
            onClick={() => setColor("default")}
            className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform flex items-center justify-center text-xs"
            aria-label="Remove color"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ToolbarButton
        editor={editor}
        icon={Palette}
        label="Text Color"
        isActive={editor.isActive("textStyle")}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      />
    </div>
  );
};

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
          horizontalRule: {
            HTMLAttributes: {
              class: "my-4 border-t border-border",
            },
          },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
        }),
        Highlight.configure({
          multicolor: true,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Subscript,
        Superscript,
        TextStyle,
        Color.configure({
          types: ["textStyle"],
        }),
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
          {/* History */}
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

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Text Formatting */}
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

          {/* Headings */}
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

          {/* Alignment */}
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
            <ToolbarButton
              editor={editor}
              icon={AlignJustify}
              label="Align Justify"
              isActive={editor.isActive({ textAlign: "justify" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              disabled={disabled}
            />
          </ToolbarSection>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Lists */}
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
              icon={ListTodo}
              label="Task List"
              isActive={editor.isActive("taskList")}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              disabled={
                disabled || !editor.can().chain().focus().toggleTaskList().run()
              }
            />
          </ToolbarSection>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Insert */}
          <ToolbarSection>
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
            <ToolbarButton
              editor={editor}
              icon={Minus}
              label="Horizontal Rule"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              disabled={disabled}
            />
            <LinkPopover editor={editor} disabled={disabled} />
          </ToolbarSection>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Special Formatting */}
          <ToolbarSection>
            <ToolbarButton
              editor={editor}
              icon={Highlighter}
              label="Highlight"
              isActive={editor.isActive("highlight")}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleHighlight().run()
              }
            />
            <ColorPicker editor={editor} disabled={disabled} />
            <ToolbarButton
              editor={editor}
              icon={SubscriptIcon}
              label="Subscript"
              isActive={editor.isActive("subscript")}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleSubscript().run()
              }
            />
            <ToolbarButton
              editor={editor}
              icon={SuperscriptIcon}
              label="Superscript"
              isActive={editor.isActive("superscript")}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              disabled={
                disabled ||
                !editor.can().chain().focus().toggleSuperscript().run()
              }
            />
          </ToolbarSection>

          <div className="flex-1" />

          {/* Clear Formatting */}
          <ToolbarSection>
            <ToolbarButton
              editor={editor}
              icon={RemoveFormatting}
              label="Clear Formatting"
              onClick={() =>
                editor.chain().focus().clearNodes().unsetAllMarks().run()
              }
              disabled={disabled}
            />
          </ToolbarSection>
        </div>

        {/* Editor Content */}
        <div className="relative">
          <EditorContent
            editor={editor}
            className={cn(
              "prose prose-sm dark:prose-invert max-w-none p-4",
              "prose-headings:font-semibold prose-headings:text-foreground",
              "prose-p:text-foreground prose-p:leading-relaxed",
              "prose-strong:font-semibold prose-strong:text-foreground",
              "prose-em:italic prose-em:text-foreground",
              "prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:rounded-r",
              "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-foreground",
              "prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2",
              "prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2",
              "prose-li:my-1 prose-li:text-foreground",
              "prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-6",
              "prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-5",
              "prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4",
              "[&_.ProseMirror]:min-h-[200px]",
              "[&_.ProseMirror]:focus:outline-none",
              "[&_.ProseMirror]:outline-none",
              // Task list styles
              "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0",
              "[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-center [&_ul[data-type=taskList]_li]:gap-2",
              "[&_ul[data-type=taskList]_li_input]:w-4 [&_ul[data-type=taskList]_li_input]:h-4",
              // Highlight styles
              "[&_mark]:bg-yellow-300 [&_mark]:text-black [&_mark]:px-0.5 [&_mark]:rounded",
              // Subscript/Superscript
              "[&_sub]:text-xs [&_sup]:text-xs",
              // Link styles
              "[&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-primary/80",
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
