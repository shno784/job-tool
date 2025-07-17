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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  if (isLoading) return <CoverletterLoading />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      {/* Upload + Job Description Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tailor Your Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileDropzone onFileChange={setFile} file={file} />

          <div className="space-y-1">
            <Label htmlFor="jobDesc" className="block font-medium">
              Job Description
            </Label>
            <div className="flex space-x-4">
              <Input
                id="jobDesc"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the job description here…"
                className="flex-1"
              />
              <Button onClick={handleSubmit}>Tailor My Resume</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {html && (
        <>
          <Separator />

          {/* Customized Resume Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Customized Resume Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border p-4 bg-white">
                <TextEditor content={html} onUpdate={setHtml} />
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleDownloadPdf} variant="secondary">
                  Download PDF
                </Button>
                <Button onClick={() => window.print()} variant="outline">
                  Print / Save as PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
