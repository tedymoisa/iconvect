import { ApiResponse } from "@/lib/types/api-response";
import { extractAndSanitizeSvg } from "@/lib/utils";
import { NextResponse } from "next/server";

const svg =
  '```xml\n<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">\n  <rect stroke-width="2" fill="none" stroke="white" rx="2" height="14" width="20" y="4" x="2"></rect>\n  <line stroke-width="2" stroke="white" y2="22" x2="16" y1="22" x1="8"></line>\n  <line stroke-width="2" stroke="white" y2="22" x2="12" y1="18" x1="12"></line>\n</svg>\n```';

export const GET = async () => {
  return NextResponse.json<ApiResponse<string>>({ result: extractAndSanitizeSvg(svg)! }, { status: 200 });
};
