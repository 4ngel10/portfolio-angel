import { NextResponse } from "next/server";

/**
 * Contact form endpoint.
 *
 * Default implementation: logs the message server-side and returns 200.
 * Wire your own transport (Resend, Postmark, SendGrid, Formspree) by filling
 * in the `send()` function. Keep the API shape unchanged so the client stays simple.
 *
 * Environment variables expected if you use Resend:
 *   RESEND_API_KEY=...
 *   CONTACT_TO=angelfernandezgarriga@gmail.com
 */

async function send({ name, email, message }: { name: string; email: string; message: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    console.log("[contact]", { name, email, message });
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Portfolio <noreply@angelfernandez.dev>",
      to,
      reply_to: email,
      subject: `Nuevo mensaje de ${name}`,
      text: `De: ${name} <${email}>\n\n${message}`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    await send({ name, email, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
