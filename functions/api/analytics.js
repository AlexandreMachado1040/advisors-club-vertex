export async function onRequestGet(context) {
  const { env, request } = context;

  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (!env.ADMIN_PASSWORD || token !== env.ADMIN_PASSWORD) {
    return json({ error: 'Não autorizado' }, 401);
  }

  const db = env.DB;
  if (!db) return json({ error: 'Banco D1 não configurado' }, 500);

  try {
    const sessionsResult = await db.prepare(`
      SELECT
        s.id, s.mentorada_nome, s.mentorada_email, s.empresa_nome,
        s.created_at, s.updated_at,
        COUNT(mp.id) as modules_completed,
        MAX(mp.completed_at) as last_module_at,
        (SELECT COUNT(*) FROM reports r WHERE r.session_id = s.id) as reports_sent
      FROM sessions s
      LEFT JOIN module_progress mp ON mp.session_id = s.id
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `).all();

    const moduleProgressResult = await db.prepare(`
      SELECT session_id, module_number, module_name, completed_at
      FROM module_progress
      ORDER BY session_id, module_number
    `).all();

    const reportsResult = await db.prepare(`
      SELECT r.id, r.session_id, r.mentorada_email, r.sent_at,
             s.mentorada_nome, s.empresa_nome
      FROM reports r
      JOIN sessions s ON s.id = r.session_id
      ORDER BY r.sent_at DESC
      LIMIT 50
    `).all();

    const countResult = await db.prepare('SELECT COUNT(*) as count FROM reports').first();

    const sessions = sessionsResult.results || [];
    const totalModules = sessions.reduce((sum, s) => sum + (s.modules_completed || 0), 0);

    return json({
      sessions,
      module_progress: moduleProgressResult.results || [],
      reports: reportsResult.results || [],
      totals: {
        sessions: sessions.length,
        modules_completed: totalModules,
        reports_sent: countResult?.count || 0,
        avg_modules: sessions.length > 0
          ? Math.round(totalModules / sessions.length * 10) / 10
          : 0
      }
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
