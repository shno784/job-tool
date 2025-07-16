// src/app/upload/UploadPage.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FileDropzone } from "@/components/Dropzone";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleFile = useCallback(
    async (f: File) => {
      setFile(f);
      const data = new FormData();
      data.append("file", f);

      try {
        const res = await axios.post("/api/process-document", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const result = res.data;
        if (result.error) {
          alert("Error: " + result.error);
          return;
        }

        // 1) generate a simple unique ID (e.g. timestamp)
        const id = Date.now().toString();

        // 2) persist under that ID
        sessionStorage.setItem(`result-${id}`, JSON.stringify(result));

        // 3) navigate to the dynamic route
        router.push(`/resume-analyser/${id}`);
      } catch (err: any) {
        alert("Upload failed: " + (err.response?.data?.error || err.message));
      }
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <FileDropzone onFileChange={handleFile} file={file} />
    </div>
  );
}
