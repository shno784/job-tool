"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import TextEditor from "@/components/text-editor";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function CoverLetterResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the saved HTML on mount
  useEffect(() => {
    const raw = sessionStorage.getItem(`coverletter-${id}`);
    if (!raw) {
      // No saved cover letter—go back to the generator
      router.replace("/generate-cover-letter");
      return;
    }
    setHtml(raw);
    setIsLoading(false);
  }, [id, router]);

  // Download as PDF by sending HTML to your /api/render-pdf endpoint
  const handleDownloadPdf = async () => {
    if (!html) {
      alert("Nothing to download yet!");
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
      a.download = "cover_letter.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading your cover letter…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
      <h1 className="text-3xl font-bold text-center">
        Your Generated Cover Letter
      </h1>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border p-4 ">
            {/* Let user edit the HTML if desired */}
            <TextEditor content={html!} onUpdate={setHtml!} />
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

      <div className="text-center">
        <button
          onClick={() => router.push("/generate-cover-letter")}
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Generate Another
        </button>
      </div>
    </div>
  );
}
