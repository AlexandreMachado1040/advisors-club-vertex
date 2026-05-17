export async function onRequestPost(context) {
  const { request, env } = context;

  const RESEND_KEY     = env.RESEND_API_KEY;
  const CAROLINE_EMAIL = env.CAROLINE_EMAIL || 'alexandreclm@gmail.com';
  const FROM_EMAIL     = env.FROM_EMAIL     || 'onboarding@resend.dev';

  if (!RESEND_KEY) {
    return json({ error: 'RESEND_API_KEY não configurada. Configure o secret no Cloudflare.' }, 500);
  }

  const { to, empresa, html } = await request.json();

  if (!to || !to.includes('@')) {
    return json({ error: 'E-mail do destinatário inválido.' }, 400);
  }

  const recipients = [to];
  if (CAROLINE_EMAIL && CAROLINE_EMAIL !== to) recipients.push(CAROLINE_EMAIL);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    `Advisory Estratégico <${FROM_EMAIL}>`,
      to:      recipients,
      subject: `Relatório Advisory — ${empresa}`,
      html,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return json({ error: data.message || `Resend retornou HTTP ${res.status}` }, 500);
  }

  return json({ success: true, id: data.id });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
