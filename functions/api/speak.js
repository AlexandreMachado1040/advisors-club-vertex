// Proxy para ElevenLabs TTS — mantém a API key segura no servidor
// Env vars necessárias:
//   ELEVENLABS_API_KEY  → chave da conta ElevenLabs
//   ELEVENLABS_VOICE_ID → ID da voz clonada da Carol (após upload na plataforma)

export async function onRequestPost(context) {
  const { request, env } = context;
  const KEY      = env.ELEVENLABS_API_KEY;
  const VOICE_ID = env.ELEVENLABS_VOICE_ID;

  if (!KEY || !VOICE_ID) {
    return new Response(JSON.stringify({ error: 'elevenlabs_not_configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { text } = await request.json();
  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: 'texto vazio' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key':   KEY,
      'Content-Type': 'application/json',
      'Accept':       'audio/mpeg'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability:        0.45,
        similarity_boost: 0.90,
        style:            0.30,
        use_speaker_boost: true
      }
    })
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    const msg = err.detail?.message || `HTTP ${r.status}`;
    console.error('[speak] ElevenLabs error:', r.status, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: r.status, headers: { 'Content-Type': 'application/json' }
    });
  }

  const audio = await r.arrayBuffer();
  return new Response(audio, {
    headers: {
      'Content-Type':  'audio/mpeg',
      'Cache-Control': 'no-store'
    }
  });
}
