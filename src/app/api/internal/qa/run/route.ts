import { NextResponse } from "next/server";
import { isInternalQaEnabled } from "@/lib/qa/enabled";
import { runQaCaseById } from "@/lib/qa/runner";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isInternalQaEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const caseId =
    typeof body === "object" &&
    body !== null &&
    "caseId" in body &&
    typeof (body as { caseId: unknown }).caseId === "string"
      ? (body as { caseId: string }).caseId
      : null;

  if (!caseId) {
    return NextResponse.json(
      { ok: false, error: "caseId is required" },
      { status: 400 },
    );
  }

  const result = await runQaCaseById(caseId);
  if (!result) {
    return NextResponse.json(
      { ok: false, error: `Unknown case: ${caseId}` },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, result });
}
