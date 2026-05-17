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

  const isTeste  = FROM_EMAIL.includes('resend.dev');
  const recipients = isTeste
    ? [CAROLINE_EMAIL]                                           // modo teste: só Caroline
    : [...new Set([to, CAROLINE_EMAIL].filter(Boolean))];       // produção: mentorado + Caroline

  async function enviar(tos) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    `Advisory Estratégico <${FROM_EMAIL}>`,
        to:      tos,
        subject: `Relatório Advisory — ${empresa}`,
        html,
      }),
    });
    return { r, data: await r.json().catch(() => ({})) };
  }

  let { r, data } = await enviar(recipients);

  // Se falhou por restrição de teste (sender não verificado), tenta só com Caroline
  if (!r.ok && (data.message || '').includes('testing')) {
    ({ r, data } = await enviar([CAROLINE_EMAIL]));
    if (r.ok) {
      return json({
        success: true, id: data.id,
        aviso: `Modo de teste: enviado apenas para Caroline (${CAROLINE_EMAIL}). Para enviar também para a mentorada, verifique um domínio em resend.com/domains.`
      });
    }
  }

  if (!r.ok) {
    return json({ error: data.message || `Resend HTTP ${r.status}` }, 500);
  }

  return json({ success: true, id: data.id });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
