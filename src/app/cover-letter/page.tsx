// components/TailorResume.tsx
"use client";

import React, { useCallback, useState } from "react";
import { FileDropzone } from "@/components/Dropzone";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/text-editor";
import CoverletterLoading from "./loading";

export default function TailorResume() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!file) return alert("Please upload a resume PDF first.");
    if (!jobDesc.trim()) return alert("Please paste in the job description.");

    setIsLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("jobDesc", jobDesc);
      const res = await axios.post("/api/enhance-cv", form, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "text",
      });
      setHtml(res.data);
    } catch (e: any) {
      alert("Error tailoring resume: " + (e.message || e));
    } finally {
      setIsLoading(false);
    }
  }, [file, jobDesc]);

  const handleDownloadPdf = useCallback(async () => {
    if (!html) {
      alert("Nothing to convert yet!");
      return;
    }

    try {
      const res = await axios.post(
        "/api/render-pdf",
        { html },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customized_resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check console for details.");
    }
  }, [html]);

  return (
    <>
      {isLoading ? (
        <CoverletterLoading />
      ) : (
        <div className="space-y-6">
          <FileDropzone onFileChange={setFile} file={file} />

          <div>
            <Label htmlFor="jobDesc" className="ml-20 block font-medium">
              Job Description
            </Label>
            <div className="flex space-x-5">
              <Input
                id="jobDesc"
                className="ml-20 mt-1 w-full border rounded p-2 max-w-[50%]"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the job description here…"
              />
              <Button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Tailor My Resume
              </Button>
            </div>
          </div>

          {html && (
            <div className="mt-8">
              <h2 className="ml-[10%] text-xl font-semibold mb-4">
                Customised Resume Preview
              </h2>
              <div className="ml-[10%] max-w-[70%] border p-4 bg-white">
                <TextEditor content={html} onUpdate={setHtml} />
              </div>

              <div className="mt-4 flex space-x-2 ml-[10%]">
                <Button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Download PDF
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Print / Save as PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
