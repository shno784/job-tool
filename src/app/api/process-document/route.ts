// -----------------------------------------------------------------------------
// IMPORTS
// -----------------------------------------------------------------------------
import { NextResponse, type NextRequest } from "next/server";
import { Buffer } from "buffer";
import mammoth from "mammoth";
import { createRequire } from "module";
import { load, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { pipeline, env } from "@xenova/transformers";
import os from "os";
import path from "path";
import { v4 as uuid } from "uuid";

const require = createRequire(import.meta.url);
const pdf2html = require("pdf2html");

// -----------------------------------------------------------------------------
// ONE-TIME MODEL INIT
// -----------------------------------------------------------------------------
env.allowRemoteModels = true;
env.localModelPath = path.join(os.tmpdir(), "hf_models");

const qaPromise  = pipeline("question-answering");
const nerPromise = pipeline("token-classification");
const sumPromise = pipeline("summarization");

// -----------------------------------------------------------------------------
// JOB STORE
// -----------------------------------------------------------------------------
type Job = {
  progress: number;
  result?: any;
  listeners: Set<ReadableStreamDefaultController>;
};
const jobs = new Map<string, Job>();

function update(id: string, progress: number, result?: any) {
  let job = jobs.get(id);
  if (!job) {
    job = { progress: 0, listeners: new Set() };
    jobs.set(id, job);
  }
  job.progress = progress;
  if (result !== undefined) job.result = result;

  for (const ctrl of job.listeners) {
    ctrl.enqueue(
      `data: ${JSON.stringify({
        progress: job.progress,
        result: job.result ?? null,
      })}\n\n`
    );
  }
}

// -----------------------------------------------------------------------------
// TOKEN HELPERS
// -----------------------------------------------------------------------------
function untokenize(tokens: any[]) {
  const out: any[] = [];
  for (const t of tokens) {
    if (t.word.startsWith("##") && out.length) {
      out[out.length - 1].word += t.word.slice(2);
    } else out.push({ ...t });
  }
  return out;
}

function groupEntities(tokens: any[]) {
  const g: Record<string, Set<string>> = {
    PER: new Set(),
    ORG: new Set(),
    LOC: new Set(),
  };
  let buf = "", tag = "";
  for (const { entity, word } of tokens) {
    const type = entity.slice(2);
    if (entity.startsWith("B-")) {
      if (buf) g[tag].add(buf.trim());
      buf = word.replace(/^##/, "");
      tag = type;
    } else if (entity.startsWith("I-") && type === tag) {
      buf += word.startsWith("##") ? word.slice(2) : " " + word;
    }
  }
  if (buf) g[tag].add(buf.trim());
  return Object.fromEntries(Object.entries(g).map(([k, v]) => [k, [...v]]));
}

// -----------------------------------------------------------------------------
// POST  – start processing
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as Blob | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = uuid();

  update(id, 0);
  processDoc(buffer, file.type, id).catch(console.error);

  return NextResponse.json({ id });
}

// -----------------------------------------------------------------------------
// GET  – progress stream
// -----------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")!;
  const job = jobs.get(id);
  if (!job) return new Response("not found", { status: 404 });

  const stream = new ReadableStream({
    start(ctrl) {
      job.listeners.add(ctrl);
      ctrl.enqueue(`data: ${JSON.stringify({ progress: job.progress, result: null })}\n\n`);
    },
    cancel(ctrl) {
      job.listeners.delete(ctrl as any);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// -----------------------------------------------------------------------------
// MAIN WORKER
// -----------------------------------------------------------------------------
async function processDoc(buffer: Buffer, mime: string, id: string) {
  /* 10 % */
  update(id, 10);
  const magic = buffer.subarray(0, 4).toString();
  const html =
    mime === "application/pdf" || magic === "%PDF"
      ? await pdf2html.html(buffer)
      : (await mammoth.convertToHtml({ buffer })).value;

  /* 25 % */
  update(id, 25);
  const $ = load(html);
  const plain = $("body").text();

  /* 40 % */
  update(id, 40);
  const [qa, ner, summarizer] = await Promise.all([qaPromise, nerPromise, sumPromise]);

  /* 55 % */
  update(id, 55);
  const sk  = await qa("What skills does the candidate have?", plain);
  const edu = await qa("What education credentials are listed?", plain);
  const skills     = (Array.isArray(sk) ? sk[0] : sk).answer;
  const education  = (Array.isArray(edu) ? edu[0] : edu).answer;

  /* 70 % */
  update(id, 70);
  const entities = groupEntities(untokenize(await ner(plain)));

  /* 90 % */
  update(id, 90);
  const layoutTips = await buildLayoutTips($, plain, summarizer);

  /* 100 % */
  update(id, 100, {
    skills: skills.split(/[,;•\n]+/).map(s => s.trim()).filter(Boolean),
    education,
    entities,
    layoutTips,
  });
}

// -----------------------------------------------------------------------------
// TIP GENERATOR  (typed)
// -----------------------------------------------------------------------------
async function buildLayoutTips(
  $: CheerioAPI,
  plain: string,
  summarizer: Awaited<typeof sumPromise>
): Promise<string[]> {

  /* headings → canonical map ------------------------------------------------ */
  const CANON: Record<string, string[]> = {
    SUMMARY: ["summary", "profile"],
    SKILLS: ["skills", "key skills"],
    "TECHNICAL SKILLS": ["technical skills", "tech skills"],
    EXPERIENCE: ["experience", "work history", "professional experience"],
    PROJECTS: ["projects", "selected projects"],
    EDUCATION: ["education", "academic history"],
    CERTIFICATIONS: ["certifications", "certificates", "licenses"],
    COURSEWORK: ["coursework", "relevant coursework"],
    PORTFOLIO: ["portfolio", "selected works"],
  };

  const present = new Set<string>();
  $("h1,h2,h3,h4,h5,h6,strong,b,u").each((_: number, el: Element) => {
    const t = $(el).text().trim().toLowerCase();
    for (const [canon, syn] of Object.entries(CANON))
      if (syn.some(s => t.startsWith(s))) present.add(canon);
  });

  /* flavour ----------------------------------------------------------------- */
  const flavour = detectFlavour(plain);
  const want: Record<string, string[]> = {
    tech:   ["SUMMARY","TECHNICAL SKILLS","EXPERIENCE","PROJECTS","EDUCATION"],
    creative:["SUMMARY","SKILLS","PORTFOLIO","EXPERIENCE","EDUCATION"],
    business:["SUMMARY","SKILLS","EXPERIENCE","EDUCATION","CERTIFICATIONS"],
    student:["SUMMARY","EDUCATION","PROJECTS","EXPERIENCE","COURSEWORK"],
    healthcare:["SUMMARY","SKILLS","EXPERIENCE","EDUCATION","CERTIFICATIONS"],
    general:["SUMMARY","SKILLS","EXPERIENCE","EDUCATION"],
  };

  const tips: string[] = [];
  for (const h of want[flavour]) {
    if (!present.has(h))
      tips.push(`Add a **${h}** section so employers & ATS can locate it quickly.`);
  }
  if ([...present].filter(h => h === "EDUCATION").length > 1)
    tips.push("Merge duplicate **EDUCATION** sections into one block.");

  /* bullet density ---------------------------------------------------------- */
  const total = plain.split(/\n/).length;
  const bullet = (plain.match(/^[•*-]/gm) || []).length;
  if (bullet / total < 0.15)
    tips.push("Convert dense paragraphs into concise bullet points (4-6 per role).");
  else if (bullet / total > 0.50)
    tips.push("Group related bullets under sub-headings to avoid very long lists.");

  /* metrics ----------------------------------------------------------------- */
  if (!/\d[%$]|[\d,]{3,}\s*(users|customers|downloads|servers)/i.test(plain))
    tips.push("Add concrete metrics ( %, $, # ) to show impact (e.g. “Cut costs by 15 %”).");

  /* address length ---------------------------------------------------------- */
  if ((plain.match(/(street|road|avenue|vc\d+)/i) || []).length > 2)
    tips.push("Trim address to **City, Country**; ATS doesn’t need the full postal code.");

  /* tiny fonts -------------------------------------------------------------- */
  const small = $("span[style*='font-size']")
    .filter((_: number, el: Element) => {
      const m = /font-size:\s*(\d{1,2})/i.exec($(el).attr("style")!);
      return m ? parseInt(m[1], 10) < 9 : false;
    }).length;
  if (small) tips.push("Increase tiny font sizes (<9 pt) for readability.");

  /* summariser polish tip ---------------------------------------------------- */
  try {
    type SumOut = { summary_text?: string; generated_text?: string };
    const out = await summarizer(
      "One short bullet to polish this resume's formatting:\n\n" + plain.slice(0, 2000),
      { min_length: 20, max_length: 40 }
    ) as unknown as SumOut[];
    const extra = out[0]?.summary_text ?? out[0]?.generated_text ?? "";
    if (extra) tips.push(extra.replace(/^[-•\s]+/, "").trim());
  } catch { /* ignore */ }

  return tips.slice(0, 10);
}

/* flavour detector ---------------------------------------------------------- */
function detectFlavour(txt: string):
  "tech" | "creative" | "business" | "student" | "healthcare" | "general" {
  const KW: Record<string, string[]> = {
    tech:["python","docker","kubernetes","react","aws","ci/cd","node","sql"],
    creative:["photoshop","illustrator","figma","premiere","branding"],
    business:["kpi","roi","salesforce","crm","budgeting","forecasting"],
    student:["gpa","coursework","bachelor","master","capstone","thesis"],
    healthcare:["clinical","patient care","emr","hipaa","icu"],
  };
  const lower = txt.toLowerCase();
  for (const [k, list] of Object.entries(KW))
    if (list.some(w => lower.includes(w))) return k as any;
  return "general";
}
