export async function onRequestPost(context) {
  const { env, request } = context;

  const API_KEY = env.ELEVENLABS_API_KEY;
  if (!API_KEY) return json({ error: 'ElevenLabs não configurado' }, 500);

  const formData = await request.formData();
  const audio    = formData.get('audio');
  if (!audio) return json({ error: 'Nenhum áudio enviado' }, 400);

  const form = new FormData();
  form.append('file', audio, 'audio.webm');
  form.append('model_id', 'scribe_v1');
  form.append('language_code', 'pt');

  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY },
    body: form
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    return json({ error: err.detail?.message || `ElevenLabs STT HTTP ${r.status}` }, r.status);
  }

  const data = await r.json();
  return json({ text: data.text || '' });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
