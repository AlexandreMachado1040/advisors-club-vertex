const MODEL = 'gemini-2.5-flash-lite';
const MAX_RETRIES = 3;

async function callGemini(KEY, systemPrompt, userMessage) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
  });

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    if (r.ok) {
      const data = await r.json();
      return { text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '' };
    }

    const err = await r.json().catch(() => ({}));
    const msg = err.error?.message || '';

    if (r.status === 429) {
      attempt++;
      const match = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
      const wait  = match ? Math.ceil(parseFloat(match[1])) * 1000 + 500 : 15000;
      await new Promise(res => setTimeout(res, wait));
      continue;
    }

    return { error: msg || `HTTP ${r.status}` };
  }

  return { error: 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.' };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const KEY = env.GEMINI_API_KEY;

  if (!KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { systemPrompt, userMessage } = await request.json();
  const result = await callGemini(KEY, systemPrompt, userMessage);

  if (result.error) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 429, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ text: result.text }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
