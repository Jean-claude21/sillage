import { env } from './env';

export interface Mail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

/**
 * Sends an e-mail through Resend when RESEND_API_KEY is set; otherwise writes it to the server log,
 * so every flow works before the shop's sending domain is ready. A failure never cancels an order.
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (!env.resendApiKey) {
    console.info(`[mail] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.mailFrom,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[mail] refused: ${res.status}`);
  } catch (error) {
    console.error('[mail] failed', error);
  }
}
