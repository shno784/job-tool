import { NextResponse } from "next/server";
import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

export const config = {
  api: { bodyParser: false, sizeLimit: "10mb" },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const media = path.join(__dirname, "..", "third_party");
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";
  if (!ct.startsWith("multipart/form-data")) {
    return NextResponse.json(
      { error: "Use multipart/form-data" },
      { status: 415 }
    );
  }
  const form = await req.formData();
  const file = form.get("file");
const additionalNotesRaw = form.get("additionalNotes");
const additionalNotes =
  typeof additionalNotesRaw === "string" ? additionalNotesRaw.trim() : "";

  const jobDesc = form.get("jobDesc");
  if (typeof jobDesc !== "string") {
    return NextResponse.json(
      { error: "Missing job description" },
      { status: 400 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  await fs.mkdir(media, { recursive: true });

  const outpath = path.join(media, file.name);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(outpath, Buffer.from(arrayBuffer));

  let sample = await client.files.upload({
    file: outpath,
    config: { mimeType: "application/pdf" },
  });
  console.log("job description is ", jobDesc);
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
       `
When given a job description (and optional additional notes), you will:

1. Produce a formal, business-style cover letter in valid HTML (no Markdown).
2. Use these HTML tags for structure:
   - <p> for paragraphs
   - <strong> to highlight keywords
3. Follow this layout:
   <p>Dear [Hiring Manager Name or "Hiring Team"],</p>
   <p><strong>Opening:</strong> State the role you’re applying for, where you found it, and a one-sentence hook about why you’re excited.</p>
   <p><strong>Body:</strong> Two to three short paragraphs that:
      • Match your top skills/experiences to the job description keywords.
      • Weave in any additional notes if provided (tone, achievements, focus).
      • Show understanding of the company’s mission or challenges.
   </p>
   <p><strong>Closing:</strong> Thank them, restate enthusiasm, and invite next steps.</p>
   <p>Sincerely,</p>
   <p>[Your Name]</p>
4. Keep the letter between 200 and 350 words.
5. If no additional notes are provided, simply omit that step—do not mention it.
6. Return only the HTML of the letter; do not add any commentary or analysis.
This is the job description ${jobDesc} and this is the additonal notes, if it's not empty ensure to listen to the Request
if it is empty just ignore it, here it is "${additionalNotes}". Also don't forget to add stuff frmo the CV that was given to you.
`.trim(),
      // 3) Your uploaded PDF
      createPartFromUri(sample.uri!, sample.mimeType!),
    ]),
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      systemInstruction: "You are a professional career coach and expert cover-letter writer.",
    },
  });
  return new NextResponse(response.text, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
