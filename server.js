require('dotenv').config();
const express = require('express');
const path    = require('path');

const app   = express();
const PORT  = process.env.PORT || 3000;
const KEY   = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

if (!KEY) {
  console.error('\n❌  GEMINI_API_KEY não encontrada no arquivo .env\n');
  process.exit(1);
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

async function callGemini(systemPrompt, userMessage) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
  });

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    // Sucesso
    if (r.ok) {
      const data = await r.json();
      return { text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '' };
    }

    const err = await r.json().catch(() => ({}));
    const msg = err.error?.message || '';

    // Rate limit — ler tempo de espera e retry automático
    if (r.status === 429) {
      attempt++;
      const match = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
      const wait  = match ? Math.ceil(parseFloat(match[1])) * 1000 + 500 : 15000;
      console.log(`⏳  Rate limit — aguardando ${Math.round(wait/1000)}s (tentativa ${attempt}/${MAX_RETRIES})`);
      await new Promise(res => setTimeout(res, wait));
      continue;
    }

    // Outros erros — não retry
    return { error: msg || `HTTP ${r.status}` };
  }

  return { error: 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.' };
}

/* ── Proxy ── */
app.post('/api/analyze', async (req, res) => {
  try {
    const { systemPrompt, userMessage } = req.body;
    const result = await callGemini(systemPrompt, userMessage);
    if (result.error) return res.status(429).json({ error: result.error });
    res.json({ text: result.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✦  VERTEX IA rodando em http://localhost:${PORT}/vertex_app.html`);
  console.log(`   Modelo: ${MODEL}\n`);
});
