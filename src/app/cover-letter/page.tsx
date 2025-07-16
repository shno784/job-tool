"use client";
import React, { useCallback, useRef, useState } from "react";
import { FileDropzone } from "@/components/Dropzone";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/text-editor";

export default function TailorResume() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const editableRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!file) {
      alert("Please upload a resume PDF first.");
      return;
    }
    if (!jobDesc.trim()) {
      alert("Please paste in the job description.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("jobDesc", jobDesc);

    try {
      const res = await axios.post("/api/enhance-cv", data, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "text",
      });

      const fetchedHtml = res.data;
      setHtml(fetchedHtml);

      // Inject into the editable DIV exactly once:
      if (editableRef.current) {
        editableRef.current.innerHTML = fetchedHtml;
        // put the caret at the end:
        const range = document.createRange();
        range.selectNodeContents(editableRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        editableRef.current.focus();
      }
    } catch (error: any) {
      alert(
        "Something went wrong: " +
          (error.response?.data?.error ?? error.message)
      );
    }
  }, [file, jobDesc]);

  // If you still want to keep the React `html` state in sync on blur:
  const handleBlur = () => {
    if (editableRef.current) {
      setHtml(editableRef.current.innerHTML);
    }
  };

  return (
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

      {/* Always render the editor; its content is injected directly once */}
      <div className="mt-8">
        <h2 className="ml-[10%] text-xl font-semibold mb-4">
          Customised Resume Preview
        </h2>
        <div className="ml-[10%] max-w-[70%]">
          <TextEditor content={html} onUpdate={(newHtml) => setHtml(newHtml)} />
        </div>

        <Button
          onClick={() => {
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "customized_resume.html";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Download HTML
        </Button>
        <Button
          onClick={() => window.print()}
          className="mt-4 ml-2 px-4 py-2 bg-gray-600 text-white rounded"
        >
          Print / Save as PDF
        </Button>
      </div>
    </div>
  );
}
