export async function onRequestPost(context) {
  const { env, request } = context;
  const { password } = await request.json().catch(() => ({}));

  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return json({ error: 'Senha incorreta' }, 401);
  }

  return json({ ok: true, token: env.ADMIN_PASSWORD });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
