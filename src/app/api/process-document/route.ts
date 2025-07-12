export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from "next/server";
import { Buffer } from "buffer";
import PDFParser from "pdf2json";
import docx4js from "docx4js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // 1) Pull the file out of the multipart/form-data
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    if (!file) {
      console.error("No file in formData");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2) Read it into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3) Debug: what did we actually get?
    console.log("➔ file.type:", file.type);
    console.log("➔ first 4 bytes:", buffer.subarray(0, 4).toString("utf8"));

    // 4) Decide PDF vs DOCX
    const isPDF =
      file.type === "application/pdf" ||
      buffer.subarray(0, 4).toString("utf8") === "%PDF";
    let parsedItems;
    if (isPDF) {
      parsedItems = await parsePDF(buffer);
    } else {
      parsedItems = await parseDocx(buffer);
    }

    // 5) Build and call OpenAI
    const prompt = buildPrompt(parsedItems);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts resume sections with precise formatting metadata: headings, bolds, italics, indentation, and lists.",
        },
        { role: "user", content: prompt },
      ],
    });

    return NextResponse.json(
      { text: completion.choices[0].message.content },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("🚨 Route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function parsePDF(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const parser = new (PDFParser as any)();
    parser.on("pdfParser_dataError", (e: any) => {
      console.error("PDF parse error:", e.parserError);
      reject(e.parserError);
    });
    parser.on("pdfParser_dataReady", (data: any) => {
      try {
        const pages = data.formImage?.Pages || [];
        const items: any[] = [];
        pages.forEach((page: any) => {
          (page.Texts || []).forEach((item: any) => {
            const chunk = item.R?.[0] as any;
            items.push({
              text: decodeURIComponent(chunk.T || ""),
              fontSize: chunk.TS?.[0],
              isBold: chunk.TS?.[2] === 1,
              isItalic: chunk.TS?.[3] === 1,
              indent: item.x,
              headingLevel:
                chunk.TS?.[0] >= 16
                  ? 1
                  : chunk.TS?.[0] >= 14
                  ? 2
                  : null,
            });
          });
        });
        resolve(items);
      } catch (e) {
        console.error("Unexpected PDF data shape:", e);
        reject(e);
      }
    });
    parser.parseBuffer(buffer);
  });
}

async function parseDocx(buffer: Buffer): Promise<any[]> {
  try {
    const doc: any = await (docx4js as any).load(buffer);
    const content = await doc.parse();
    const items: any[] = [];
    content.forEach((node: any) => {
      if (node.type === "paragraph") {
        const style = node.properties?.pPr?.pStyle?.val;
        const indent = node.properties?.pPr?.ind?.left;
        const headingLevel = style?.startsWith("Heading")
          ? parseInt(style.replace(/\D/g, ""))
          : null;
        (node.runs || []).forEach((run: any) => {
          items.push({
            text: run.text,
            headingLevel,
            isBold: run.properties?.rPr?.b === true,
            isItalic: run.properties?.rPr?.i === true,
            indent,
          });
        });
      }
    });
    return items;
  } catch (e) {
    console.error("DOCX parse error:", e);
    throw e;
  }
}

function buildPrompt(items: any[]): string {
  return (
    `Resume content with formatting metadata:\n${JSON.stringify(
      items,
      null,
      2
    )}\n\n` +
    `Please extract the following sections ensuring you respect original formatting (headings, bold, italics, indentation, lists):\n` +
    `1. Skills (array)\n` +
    `2. Experiences (company, title, dates, description)\n` +
    `3. Education (institution, degree, dates)\n` +
    `Return a clean JSON object.`
  );
}
