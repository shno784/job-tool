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
      // 1) Instruction framing
      `I’m applying for this role in the job description.Tailor my resume—draw from the PDF below and the job description—to:
      • Emphasize the skills and experiences that match the job description
      also change any summary, personal statements or anything of the sort to kind of match the job description too, meaning if there are any 
      sectors or public jobs there, remove them and tailor the resume more to match the job description below.
      • Highlight the key words and phrases from the job description.
      Return the final resume as an HTML document with headings, bullet points, and sections. The job description is below.
       Return ONLY valid HTML (<!DOCTYPE html>…</html>), with headings, paragraphs, and lists—no markdown, no commentary.
       Return ONLY valid HTML (no markdown).  Wrap keywords you want emphasized in <strong>…</strong> tags, not **asterisks**. and PLEASE
       mark the appropriate headings with <h1></h1/> <h2></h2> etc`,
      jobDesc,
      // 3) Your uploaded PDF
      createPartFromUri(sample.uri!, sample.mimeType!),
    ]),
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });
  return new NextResponse(response.text, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
