const MODEL = 'gemini-2.5-flash-lite';

const MODULE_MAP = {
  entender: 1, diagnosticar: 2, cenarios: 3, output: 4,
  aprofundar: 5, missaovisao: 6, implicacoes: 7, planofuturo: 8
};
const MODULE_NAMES = {
  1: 'Entender', 2: 'Diagnosticar', 3: 'Cenários', 4: 'Output',
  5: 'Aprofundar', 6: 'Missão e Visão', 7: 'Implicações', 8: 'Plano de Futuro'
};

export async function onRequestPost(context) {
  const { request, env } = context;
  const KEY = env.GEMINI_API_KEY;

  if (!KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { systemPrompt, userMessage, moduleType, trackingModule, sessionData } = await request.json();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

  const temperaturas = { entender: 0.3, diagnosticar: 0.3, cenarios: 0.5, output: 0.5 };
  const temperature = temperaturas[moduleType] ?? 0.4;

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { temperature, maxOutputTokens: 8192, responseMimeType: 'application/json' }
  });

  let r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });

  if (r.status === 429) {
    const errData = await r.json().catch(() => ({}));
    const msg     = errData.error?.message || '';
    const match   = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
    const wait    = Math.min(match ? Math.ceil(parseFloat(match[1])) * 1000 + 300 : 12000, 14000);

    await new Promise(res => setTimeout(res, wait));
    r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });

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

  // Salva progresso no D1 de forma assíncrona (não bloqueia a resposta)
  if (env.DB && sessionData?.sessionId) {
    const trackedModule = trackingModule || moduleType;
    context.waitUntil(saveProgress(env.DB, sessionData, trackedModule));
  }

  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function saveProgress(db, sessionData, trackedModule) {
  const { sessionId, mentoradaEmail, empresaNome, mentoradaNome } = sessionData;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO sessions (id, mentorada_nome, mentorada_email, empresa_nome, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        mentorada_nome = COALESCE(excluded.mentorada_nome, mentorada_nome),
        empresa_nome   = COALESCE(excluded.empresa_nome, empresa_nome),
        updated_at     = excluded.updated_at
    `).bind(sessionId, mentoradaNome || null, mentoradaEmail || null, empresaNome || null, now, now).run();

    const moduleNumber = MODULE_MAP[trackedModule];
    if (moduleNumber) {
      await db.prepare(`
        INSERT OR IGNORE INTO module_progress (session_id, module_number, module_name, completed_at)
        VALUES (?, ?, ?, ?)
      `).bind(sessionId, moduleNumber, MODULE_NAMES[moduleNumber], now).run();
    }
  } catch (_) {
    // Falha silenciosa — não deve interromper o fluxo da mentorada
  }
}
