export async function onRequestPost(context) {
  const { request, env } = context;

  const { systemPrompt, userMessage } = await request.json();
  const KEY = env.GEMINI_API_KEY;

  if (!KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${KEY}`;

  const geminiRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
    })
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({}));
    return new Response(JSON.stringify({ error: err.error?.message || `HTTP ${geminiRes.status}` }), {
      status: geminiRes.status, headers: { 'Content-Type': 'application/json' }
    });
  }

  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
