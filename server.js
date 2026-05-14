require('dotenv').config();
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const KEY  = process.env.GEMINI_API_KEY;

if (!KEY) {
  console.error('\n❌  GEMINI_API_KEY não encontrada no arquivo .env\n');
  process.exit(1);
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

/* ── Proxy: recebe o input do frontend e chama o Gemini ── */
app.post('/api/analyze', async (req, res) => {
  try {
    const { systemPrompt, userMessage } = req.body;

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
      return res.status(geminiRes.status).json({ error: err.error?.message || `HTTP ${geminiRes.status}` });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    res.json({ text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✦  VERTEX IA rodando em http://localhost:${PORT}/vertex_app.html\n`);
});
