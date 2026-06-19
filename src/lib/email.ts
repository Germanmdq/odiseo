import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const adminEmail = process.env.RESEND_TO_EMAIL ?? "quotesneville@gmail.com"
export const siteUrl = process.env.NEXT_PUBLIC_URL ?? "https://odiseo.online"

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function sendOdiseoEmail(input: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  if (!resend) {
    console.error("RESEND_API_KEY no está configurada.")
    return { sent: false, error: "RESEND_API_KEY missing" }
  }

  try {
    await resend.emails.send({
      from: "Odiseo <noreply@odiseo.online>",
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    })
    return { sent: true, error: null }
  } catch (error) {
    console.error("Error enviando email:", error)
    return { sent: false, error }
  }
}
