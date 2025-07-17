import { NextResponse } from "next/server";
import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import mammoth from "mammoth";
import { write } from "fs";

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
  const entry = form.get("file");

  if (!(entry instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const file = entry;

  await fs.mkdir(media, { recursive: true });

  const outpath = path.join(media, file.name);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(outpath, Buffer.from(arrayBuffer));

  let sample;
  if (file.name.toLowerCase().endsWith(".docx")) {
    //it's a docx so convert
    let html = await convertDocx(outpath);
    if (html === undefined) {
      throw new Error("Conversion failed: no HTML returned");
    }
    let docXhtml = path.join(media, "converted.txt");
    await writeHtmlToTxt(html, docXhtml);

    sample = await client.files.upload({
      file: docXhtml,
    });
  } else {
    sample = await client.files.upload({
      file: outpath,
      config: { mimeType: "application/pdf" },
    });
  }
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
      createPartFromUri(sample.uri!, sample.mimeType!),
`Please analyze the above resume and output only valid JSON—no markdown, no explanations, no extra keys—matching exactly this skeleton:

{
  "score": 0,
  "breakdown": {
    "keywords": {
      "score": 0,
      "max": 20,
      "good": [],
      "bad": []
    },
    "formatting": {
      "score": 0,
      "max": 20,
      "good": [],
      "bad": []
    },
    "length": {
      "score": 0,
      "max": 20,
      "good": [],
      "bad": []
    },
    "readability": {
      "score": 0,
      "max": 20,
      "good": [],
      "bad": []
    },
    "impact": {
      "score": 0,
      "max": 20,
      "good": [],
      "bad": []
    }
  },
  "layoutFormat": "",
  "wordFormat": {
    "grammaticalErrors": [],
    "verbSuggestions": [],
    "quantificationSuggestions": []
  },
  "skills": [],
  "education": [],
  "experience": [],
  "headingFormat": {
    "suggestedChanges": {},
    "missingHeadings": []
  }
}

Fill in the values. Do not add, remove, or rename any keys.`
    ]),
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      responseMimeType: "application/json",
      responseJsonSchema: {
  "type": "object",
  "required": [
    "score",
    "breakdown",
    "layoutFormat",
    "wordFormat",
    "skills",
    "education",
    "experience",
    "headingFormat"
  ],
  "properties": {
    "score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "breakdown": {
      "type": "object",
      "required": ["keywords", "formatting", "length", "readability", "impact"],
      "properties": {
        "keywords": {
          "type": "object",
          "required": ["score", "max", "good", "bad"],
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 20 },
            "max":   { "type": "integer", "minimum": 0, "maximum": 20 },
            "good": { "type": "array", "items": { "type": "string" } },
            "bad":  { "type": "array", "items": { "type": "string" } }
          }
        },
        "formatting": {
          "type": "object",
          "required": ["score", "max", "good", "bad"],
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 20 },
            "max":   { "type": "integer", "minimum": 0, "maximum": 20 },
            "good": { "type": "array", "items": { "type": "string" } },
            "bad":  { "type": "array", "items": { "type": "string" } }
          }
        },
        "length": {
          "type": "object",
          "required": ["score", "max", "good", "bad"],
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 20 },
            "max":   { "type": "integer", "minimum": 0, "maximum": 20 },
            "good": { "type": "array", "items": { "type": "string" } },
            "bad":  { "type": "array", "items": { "type": "string" } }
          }
        },
        "readability": {
          "type": "object",
          "required": ["score", "max", "good", "bad"],
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 20 },
            "max":   { "type": "integer", "minimum": 0, "maximum": 20 },
            "good": { "type": "array", "items": { "type": "string" } },
            "bad":  { "type": "array", "items": { "type": "string" } }
          }
        },
        "impact": {
          "type": "object",
          "required": ["score", "max", "good", "bad"],
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 20 },
            "max":   { "type": "integer", "minimum": 0, "maximum": 20 },
            "good": { "type": "array", "items": { "type": "string" } },
            "bad":  { "type": "array", "items": { "type": "string" } }
          }
        }
      },
      "additionalProperties": false
    },
    "layoutFormat": { "type": "string" },
    "wordFormat": {
      "type": "object",
      "required": [
        "grammaticalErrors",
        "verbSuggestions",
        "quantificationSuggestions"
      ],
      "properties": {
        "grammaticalErrors": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["original", "correction"],
            "properties": {
              "original":   { "type": "string" },
              "correction": { "type": "string" }
            }
          }
        },
        "verbSuggestions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["original", "suggestion"],
            "properties": {
              "original":   { "type": "string" },
              "suggestion": { "type": "string" }
            }
          }
        },
        "quantificationSuggestions": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "skills": { "type": "array", "items": { "type": "string" } },
    "education": {
      "type": "array",
      "items": {
        "type": "object",
        "oneOf": [
          {
            "required": [
              "degree",
              "university",
              "graduationDate",
              "notes"
            ],
            "properties": {
              "degree":          { "type": "string" },
              "university":      { "type": "string" },
              "graduationDate":  { "type": "string" },
              "notes":           { "type": "string" }
            }
          },
          {
            "required": ["certificate", "year"],
            "properties": {
              "certificate": { "type": "string" },
              "year":        { "type": "string" }
            }
          }
        ]
      }
    },
    "experience": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "title",
          "company",
          "startDate",
          "endDate",
          "responsibilities"
        ],
        "properties": {
          "title":            { "type": "string" },
          "company":          { "type": "string" },
          "startDate":        { "type": "string" },
          "endDate":          { "type": "string" },
          "responsibilities": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "headingFormat": {
      "type": "object",
      "required": ["suggestedChanges", "missingHeadings"],
      "properties": {
        "suggestedChanges": { "type": "object", "additionalProperties": { "type": "string" } },
        "missingHeadings":   { "type": "array", "items": { "type": "string" } }
      }
    }
  },
  "additionalProperties": false
}
    },
  });
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No generation candidates returned");
  }
  // const jsonString = response.candidates?[0]
  const candidate = response.candidates[0];
  console.log(candidate.content);
  return NextResponse.json(candidate.content);
}
async function convertDocx(path: string) {
  try {
    const { value: html } = await mammoth.convertToHtml({ path: path });
    return html;
  } catch (error) {
    console.log(error);
  }
}
async function writeHtmlToTxt(html: string, txtPath: string) {
  await fs.writeFile(txtPath, html, "utf8");
}
