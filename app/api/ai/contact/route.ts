import { createHash } from "node:crypto";
import { Resend } from "resend";
import { MAX_EMAIL_CHARS, MAX_NOTE_CHARS } from "@/lib/ai/limits";
import { requestIp, sameOrigin, takeRateLimit } from "@/lib/ai/request";

export const runtime = "nodejs";

type ContactRequest = {
  email?: unknown;
  note?: unknown;
  company?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function response(message: string, status: number) {
  return Response.json(
    status < 400 ? { message } : { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return response("Request not allowed.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return response("Message could not be read.", 415);
  }
  if (!takeRateLimit("contact", requestIp(request), 3, 60 * 60 * 1000)) {
    return response("Please wait before trying again.", 429);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2_500) return response("Message is too large.", 413);

  let body: ContactRequest;
  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return response("Message could not be read.", 400);
  }

  // Quietly accept bot submissions so the honeypot does not teach automation.
  if (typeof body.company === "string" && body.company.trim()) {
    return response("Sent to Matt.", 200);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (
    !email ||
    email.length > MAX_EMAIL_CHARS ||
    !emailPattern.test(email) ||
    note.length > MAX_NOTE_CHARS
  ) {
    return response("Check the email address and note, then try again.", 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AI_CONTACT_FROM;
  const to = process.env.AI_CONTACT_TO;
  if (!apiKey || !from || !to) {
    return response("Email is unavailable right now. Please try again later.", 503);
  }

  const resend = new Resend(apiKey);
  const window = Math.floor(Date.now() / (10 * 60 * 1000));
  const idempotencyKey = createHash("sha256")
    .update(`${email}\u0000${note}\u0000${window}`)
    .digest("hex");

  const { error } = await resend.emails.send(
    {
      from,
      to,
      replyTo: email,
      subject: "Portfolio AI follow-up request",
      text: [
        "A visitor asked Matt to follow up from the portfolio AI tab.",
        "",
        `Reply to: ${email}`,
        "",
        "Optional note:",
        note || "No note was included.",
      ].join("\n"),
    },
    { idempotencyKey },
  );

  if (error) return response("That did not send. Please try again.", 502);
  return response("Sent to Matt.", 200);
}
