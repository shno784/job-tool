import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  List,
  ListOrdered,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";
import React from "react";
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }
  const toolbarButtons = [
    {
      icon: <Heading1 className="h-4 w-4" />,
      onClick: () => editor.chain().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      onClick: () => editor.chain().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      onClick: () => editor.chain().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="h-4 w-4" />,
      onClick: () => editor.chain().toggleBold().run(),
      pressed: editor.isActive("bold"),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      onClick: () => editor.chain().toggleItalic().run(),
      pressed: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="h-4 w-4" />,
      onClick: () => editor.chain().toggleStrike().run(),
      pressed: editor.isActive("strike"),
    },
    {
      icon: <Highlighter className="h-4 w-4" />,
      onClick: () => editor.chain().toggleHighlight().run(),
      pressed: editor.isActive("highlight"),
    },
    {
      icon: <AlignLeft className="h-4 w-4" />,
      onClick: () => editor.chain().setTextAlign("left").run(),
      pressed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="h-4 w-4" />,
      onClick: () => editor.chain().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="h-4 w-4" />,
      onClick: () => editor.chain().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <AlignJustify className="h-4 w-4" />,
      onClick: () => editor.chain().setTextAlign("justify").run(),
      pressed: editor.isActive({ textAlign: "justify" }),
    },
    {
      icon: <List className="h-4 w-4" />,
      onClick: () => editor.chain().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      onClick: () => editor.chain().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
    },
    {
      icon: <Minus className="h-4 w-4" />,
      onClick: () => editor.chain().setHorizontalRule().run(),
    },
    {
      icon: <Undo2 className="h-4 w-4" />,
      onClick: () => editor.chain().undo().run(),
    },
    {
      icon: <Redo2 className="h-4 w-4" />,
      onClick: () => editor.chain().redo().run(),
    },
  ];
  return (
    <div className="border rounded-md p-1 mb-1 bg-slate-50 dark:bg-slate-950 space-x-2 z-50">
      {toolbarButtons.map((option, index) => (
        <Toggle
          className="cursor-pointer"
          key={index}
          pressed={option.pressed ?? false}
          onPressedChange={option.onClick}
        >
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
}
