/**
 * Cloudflare Pages Function — Envio de e-mail
 *
 * Suporta dois providers (usa o primeiro que tiver chave configurada):
 *   1. Brevo (ex-Sendinblue) — recomendado, permite usar Gmail como remetente
 *   2. Resend — fallback, modo teste envia só para o próprio e-mail da conta
 *
 * Secrets necessários (Cloudflare Pages → Settings → Environment Variables):
 *   BREVO_API_KEY     — chave da conta Brevo (https://app.brevo.com/settings/keys/api)
 *   FROM_EMAIL        — remetente verificado (ex: alexandreclm@gmail.com)
 *   FROM_NAME         — nome do remetente (ex: Caroline Calaça · Advisors Club)
 *   CAROLINE_EMAIL    — e-mail da Caroline (sempre recebe cópia)
 *   RESEND_API_KEY    — fallback se BREVO_API_KEY não estiver configurada
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const BREVO_KEY      = env.BREVO_API_KEY;
  const RESEND_KEY     = env.RESEND_API_KEY;
  const FROM_EMAIL     = env.FROM_EMAIL     || 'onboarding@resend.dev';
  const FROM_NAME      = env.FROM_NAME      || 'Caroline Calaça · Advisors Club';
  const CAROLINE_EMAIL = env.CAROLINE_EMAIL || 'alexandreclm@gmail.com';

  if (!BREVO_KEY && !RESEND_KEY) {
    return json({ error: 'Nenhuma chave de e-mail configurada (BREVO_API_KEY ou RESEND_API_KEY).' }, 500);
  }

  const { to, empresa, html } = await request.json();

  if (!to || !to.includes('@')) {
    return json({ error: 'E-mail do destinatário inválido.' }, 400);
  }

  const recipients = [...new Set([to, CAROLINE_EMAIL].filter(Boolean))];

  // ── Brevo (preferencial) ─────────────────────────────────────────────
  if (BREVO_KEY) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender:      { name: FROM_NAME, email: FROM_EMAIL },
        to:          recipients.map(email => ({ email })),
        subject:     `Relatório Advisory — ${empresa}`,
        htmlContent: html,
      }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return json({ error: data.message || `Brevo HTTP ${r.status}` }, 500);
    }

    return json({ success: true, provider: 'brevo', id: String(data.messageId || data.id || '') });
  }

  // ── Resend (fallback) ────────────────────────────────────────────────
  async function enviarResend(tos) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    `${FROM_NAME} <${FROM_EMAIL}>`,
        to:      tos,
        subject: `Relatório Advisory — ${empresa}`,
        html,
      }),
    });
    return { r, data: await r.json().catch(() => ({})) };
  }

  let { r, data } = await enviarResend(recipients);

  // Fallback Resend: modo teste só permite enviar para a própria conta
  if (!r.ok && (data.message || '').toLowerCase().includes('testing')) {
    ({ r, data } = await enviarResend([CAROLINE_EMAIL]));
    if (r.ok) {
      return json({
        success: true,
        provider: 'resend-fallback',
        id: data.id || '',
        aviso: `Modo de teste Resend: enviado apenas para Caroline (${CAROLINE_EMAIL}). Configure BREVO_API_KEY para enviar para qualquer destinatário.`,
      });
    }
  }

  if (!r.ok) return json({ error: data.message || `Resend HTTP ${r.status}` }, 500);
  return json({ success: true, provider: 'resend', id: data.id || '' });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
