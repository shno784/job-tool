"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/Dropzone";

export default function JobMatcherPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(0);
    setText(null);

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post("/api/process-document", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const pct = Math.round((evt.loaded * 100) / (evt.total ?? 1));
          setProgress(pct);
        },
      });

      setProgress(100);
      setText(res.data.text as string);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, []);

  //Handle file selection: set state *and* immediately parse
  const handleFileChange = useCallback(
    (file: File) => {
      setSelectedFile(file);
      parseFile(file);
    },
    [parseFile]
  );

  return (
    <div className="space-y-4">
      <FileDropzone onFileChange={handleFileChange} file={selectedFile} />

      {loading && <Progress value={progress} className="w-full mt-2" />}

      {text && (
        <pre className="mt-4 whitespace-pre-wrap break-words">{text}</pre>
      )}
    </div>
  );
}
