"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import MenuBar from "./MenuBar";
import { useEffect, useRef } from "react";

interface TextEditorProps {
  content: string | null;
  onUpdate: (html: string) => void;
}
export default function TextEditor({ content, onUpdate }: TextEditorProps) {
  const hasLoaded = useRef(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: content,
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,

    editorProps: {
      attributes: {
        class:
          "min-h-[156px] border rounded-md py-2 px-3 bg-slate-50 dark:bg-slate-950",
      },
    },
  });
  useEffect(() => {
    if (editor && content && !hasLoaded.current) {
      editor.commands.setContent(content);
      hasLoaded.current = true;
    }
  }, [editor, content]);

  return (
    <>
      <div className="sticky top-[62px] z-40 bg-slate-50 dark:bg-slate-950 border rounded-md p-1 mb-1 space-x-2 shadow">
        <MenuBar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </>
  );
}
