// app/api/render-pdf/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { html } = await request.json().catch(() => ({}));
  if (typeof html !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid `html` in request body." },
      { status: 400 }
    );
  }

  let browser = null;
  try {
    // choose Puppeteer package
    let puppeteer: any;
    let launchOpts: any = { headless: true };
    if (process.env.NODE_ENV === "development") {
      puppeteer = require("puppeteer");
    } else {
      const chromium = require("chrome-aws-lambda");
      puppeteer    = require("puppeteer-core");
      launchOpts = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      };
    }

    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();

    // Load your HTML
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Inject a style tag that makes all text black
    await page.addStyleTag({
      content: `
        body, body * {
          color: #000 !important;
          background-color: transparent !important;
        }
      `,
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: { "Content-Type": "application/pdf" },
    });
  } catch (e: any) {
    console.error("Puppeteer error:", e);
    return NextResponse.json(
      { error: e.message || "PDF generation failed" },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
