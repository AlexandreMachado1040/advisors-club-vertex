const MODEL = 'gemini-2.5-flash-lite';

export async function onRequestPost(context) {
  const { request, env } = context;
  const KEY = env.GEMINI_API_KEY;

  if (!KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { systemPrompt, userMessage, moduleType } = await request.json();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

  const temperaturas = { entender: 0.3, diagnosticar: 0.3, cenarios: 0.5, output: 0.5 };
  const temperature = temperaturas[moduleType] ?? 0.4;

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { temperature, maxOutputTokens: 8192, responseMimeType: 'application/json' }
  });

  // Tentativa 1
  let r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });

  // Rate limit — 1 retry com espera máxima de 14s (Cloudflare tem limite de 30s)
  if (r.status === 429) {
    const errData = await r.json().catch(() => ({}));
    const msg     = errData.error?.message || '';
    const match   = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
    const wait    = Math.min(match ? Math.ceil(parseFloat(match[1])) * 1000 + 300 : 12000, 14000);

    await new Promise(res => setTimeout(res, wait));
    r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });

    // Se ainda 429 após retry — retorna erro com retryAfter para o frontend tratar
    if (r.status === 429) {
      return new Response(JSON.stringify({ error: 'rate_limit', retryAfter: 20 }), {
        status: 429, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    return new Response(JSON.stringify({ error: err.error?.message || `HTTP ${r.status}` }), {
      status: r.status, headers: { 'Content-Type': 'application/json' }
    });
  }

  const data = await r.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
