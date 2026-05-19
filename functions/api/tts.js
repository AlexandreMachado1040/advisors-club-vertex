export async function onRequestPost(context) {
  const { env, request } = context;

  const API_KEY  = env.ELEVENLABS_API_KEY;
  const VOICE_ID = env.ELEVENLABS_VOICE_ID;

  if (!API_KEY || !VOICE_ID) {
    return json({ error: 'ElevenLabs não configurado' }, 500);
  }

  const { text } = await request.json().catch(() => ({}));

  if (!text?.trim()) {
    return json({ error: 'Texto vazio' }, 400);
  }

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true }
    })
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    return json({ error: err.detail?.message || `ElevenLabs HTTP ${r.status}` }, r.status);
  }

  const audio = await r.arrayBuffer();
  return new Response(audio, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' }
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
