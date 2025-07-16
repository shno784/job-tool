// src/app/api/process-document/route.ts
import { NextResponse } from "next/server";
import { getGenerator } from "@/lib/localLLMs";

export const config = {
  api: { bodyParser: false, sizeLimit: "10mb" },
};

function extractJSON(raw: string): string {
  const start = raw.indexOf("{");
  const end   = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON found");
  }
  return raw.slice(start, end + 1);
}

export async function POST(request: Request) {
  // 1) Handle upload
  const ct = request.headers.get("content-type") || "";
  if (!ct.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "Use multipart/form-data" }, { status: 415 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();

  // 2) Parse with APILayer
  const apiRes = await fetch("https://api.apilayer.com/resume_parser/upload", {
    method: "POST",
    headers: {
      apikey: "90EEvN8hT6RbZ8auT8pKEZdohE338oAy",
      "Content-Type": "application/octet-stream",
    },
    body: arrayBuffer,
  });
  if (!apiRes.ok) {
    const txt = await apiRes.text();
    return NextResponse.json({ error: `APILayer ${apiRes.status}: ${txt}` }, { status: 502 });
  }
  const parsed = await apiRes.json();

  // 3) Generate suggestions in chunks
  const gen = (await getGenerator()) as any;

  // A) Structural
  const structurePrompt = `
You are a resume coach. Given only the section names and their current order:
${JSON.stringify(Object.keys(parsed), null, 2)}

Suggest at least three improvements to section ordering or renaming.
Return only the JSON object, with key "structural" and an array of strings.
Example: { "structural": ["Rename Work History → Professional Experience", "Move Skills above Education", "Combine Certifications and Licenses"] }
`;
  let structural: string[] = [];
  try {
    const structRaw = (await gen(structurePrompt, { max_new_tokens: 64 }))[0].generated_text;
    console.log("STRUCT RAW:", structRaw);
    structural = JSON.parse(extractJSON(structRaw)).structural;
  } catch {
    structural = [];
  }

  // B) Rewrites
  const sampleBullets = parsed.experience
    .flatMap((job: any) => job.details || [])
    .slice(0, 3);
  const rewritePrompt = `
You are a resume coach. Improve these bullet points; provide at least three rewritten examples:
${JSON.stringify(sampleBullets, null, 2)}

Return only the JSON object: { "rewrites": ["…", "…", "…"] }.
`;
  let rewrites: string[] = [];
  try {
    const rewriteRaw = (await gen(rewritePrompt, { max_new_tokens: 128 }))[0].generated_text;
    console.log("REWRITE RAW:", rewriteRaw);
    rewrites = JSON.parse(extractJSON(rewriteRaw)).rewrites;
  } catch {
    rewrites = [];
  }

  // C) Keywords
  const keywordsPrompt = `
You are a resume coach. Here are skills and job titles:
skills: ${JSON.stringify(parsed.skills)}
titles: ${JSON.stringify(parsed.experience.map((j: any) => j.position))}

Suggest at least five important, missing keywords for this resume.
Return only the JSON object: { "keywords": ["…", "…", "…", "…", "…"] }.
`;
  let keywords: string[] = [];
  try {
    const keywordsRaw = (await gen(keywordsPrompt, { max_new_tokens: 64 }))[0].generated_text;
    console.log("KEYWORDS RAW:", keywordsRaw);
    keywords = JSON.parse(extractJSON(keywordsRaw)).keywords;
  } catch {
    keywords = [];
  }

  // 4) Respond
  const suggestions = { structural, rewrites, keywords };
  return NextResponse.json({ parsed, suggestions });
}
