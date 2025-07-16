// src/middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/job-matcher/:path*",
    "/resume-analyser/:path*",
    "/cover-letter/:path*",
  ],
};
