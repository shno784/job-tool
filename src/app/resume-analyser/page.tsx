"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/Dropzone";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pct, setPct] = useState(0); // upload %
  const [proc, setProc] = useState(0); // processing %
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();

  /* ---------- 1. handle file selection & upload ---------- */
  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setPct(0);
    setProc(0);

    const data = new FormData();
    data.append("file", f);

    const { id: jobId } = await axios
      .post("/api/process-document", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (f.size) setPct(Math.round((e.loaded / f.size) * 100));
        },
      })
      .then((r) => r.data); // { id }

    setId(jobId); // triggers SSE in the effect below
  }, []);

  /* ---------- 2. open SSE once we have an id ------------- */
  useEffect(() => {
    if (!id) return;
    const es = new EventSource(`/api/process-document?id=${id}`);

    es.onmessage = (e) => {
      const { progress, result } = JSON.parse(e.data);
      setProc(progress);

      if (progress === 100) {
        es.close();
        // stash result in sessionStorage so next page can read it
        sessionStorage.setItem(`result-${id}`, JSON.stringify(result));
        router.push(`/resume-analyser/${id}`);
      }
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, [id, router]);

  /* ---------- UI ---------------------------------------- */
  return (
    <div className="space-y-6">
      <FileDropzone onFileChange={handleFile} file={file} />

      {/* upload bar */}
      {file && pct < 100 && (
        <Progress value={pct} max={100} className="w-[50%] ml-[25%]" />
      )}

      {/* processing bar */}
      {pct === 100 && proc < 100 && (
        <Progress value={proc} max={100} className="w-[50%] ml-[25%]" />
      )}
    </div>
  );
}
