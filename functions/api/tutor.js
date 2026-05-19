const MODEL = 'gemini-2.5-flash-lite';

export async function onRequestPost(context) {
  const { request, env } = context;
  const KEY = env.GEMINI_API_KEY;

  if (!KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { systemPrompt, history } = await request.json();

  if (!history || !Array.isArray(history) || history.length === 0) {
    return new Response(JSON.stringify({ error: 'histórico inválido' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: history,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
  });

  let r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });

  if (r.status === 429) {
    const errData = await r.json().catch(() => ({}));
    const msg   = errData.error?.message || '';
    const match = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
    const wait  = Math.min(match ? Math.ceil(parseFloat(match[1])) * 1000 + 300 : 8000, 12000);
    await new Promise(res => setTimeout(res, wait));
    r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    if (r.status === 429) {
      return new Response(JSON.stringify({ error: 'rate_limit' }), {
        status: 429, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    const msg = err.error?.message || `HTTP ${r.status}`;
    console.error('[tutor] Gemini error:', r.status, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: r.status, headers: { 'Content-Type': 'application/json' }
    });
  }

  const data = await r.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
