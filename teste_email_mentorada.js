const hoje = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)">

  <tr><td style="background:#0d0b08;padding:36px 40px;text-align:center">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#c9a84c;margin:0 0 16px">Relatório de Advisory Estratégico</p>
    <h1 style="font-family:Georgia,serif;font-size:2rem;font-weight:300;color:#fff;margin:0 0 6px">Studio Aura</h1>
    <p style="font-size:11px;color:#8a7a5a;letter-spacing:.1em;text-transform:uppercase;margin:0">Saúde e Bem-Estar · Pequena Empresa</p>
  </td></tr>

  <tr><td style="padding:32px 40px 24px">
    <div style="background:#f5f0e8;border-left:3px solid #c9a84c;padding:20px 24px;border-radius:0 8px 8px 0;margin-bottom:28px">
      <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#a07830;margin:0 0 10px">Grande Pergunta Estratégica</p>
      <p style="font-family:Georgia,serif;font-size:1.1rem;font-style:italic;color:#1a1208;line-height:1.7;margin:0">Como o Studio Aura pode criar um sistema de fidelização sistêmico que garanta escalabilidade, superando a dependência de instrutoras-chave e a sobrecarga das sócias?</p>
    </div>

    <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#a07830;margin:0 0 16px">Propostas Estratégicas</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece4;vertical-align:top;width:32px">
          <span style="font-family:Georgia,serif;font-size:1.4rem;font-weight:300;color:#c9a84c">01</span>
        </td>
        <td style="padding:10px 0 10px 14px;border-bottom:1px solid #f0ece4">
          <div style="font-size:13px;font-weight:600;color:#1a1208;margin-bottom:3px">Estruturar jornada de retenção de alunos</div>
          <div style="font-size:12px;color:#666;line-height:1.6">Criar processo sistêmico de acompanhamento pós-matrícula com checkpoints em 30, 60 e 90 dias para identificar risco de cancelamento antes que ele aconteça.</div>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece4;vertical-align:top">
          <span style="font-family:Georgia,serif;font-size:1.4rem;font-weight:300;color:#c9a84c">02</span>
        </td>
        <td style="padding:10px 0 10px 14px;border-bottom:1px solid #f0ece4">
          <div style="font-size:13px;font-weight:600;color:#1a1208;margin-bottom:3px">Programa de desenvolvimento de instrutores</div>
          <div style="font-size:12px;color:#666;line-height:1.6">Reduzir dependência de instrutoras-chave com trilha de formação interna, plano de carreira e protocolo documentado para cada modalidade.</div>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;vertical-align:top">
          <span style="font-family:Georgia,serif;font-size:1.4rem;font-weight:300;color:#c9a84c">03</span>
        </td>
        <td style="padding:10px 0 10px 14px">
          <div style="font-size:13px;font-weight:600;color:#1a1208;margin-bottom:3px">Definir proposta de valor e precificação premium</div>
          <div style="font-size:12px;color:#666;line-height:1.6">Formalizar o diferencial do Studio Aura e comunicar com clareza para justificar o posicionamento de preço acima dos concorrentes de baixo custo.</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#f8f5ef;padding:20px 40px;text-align:center;border-top:1px solid #e8dfc8">
    <p style="font-size:12px;color:#8a7a5a;margin:0 0 4px">Caroline Calaça · Advisors Club</p>
    <p style="font-size:11px;color:#a09080;margin:0">${hoje}</p>
  </td></tr>

</table></td></tr></table>
</body></html>`;

fetch('https://advisors-club-vertex.pages.dev/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to:      'alexandre@agti-consultoria.com.br',
    empresa: 'Studio Aura',
    html
  })
})
.then(r => r.json())
.then(d => {
  if (d.success) {
    console.log('\n✅  E-mail enviado com sucesso via', d.provider.toUpperCase());
    console.log('    Para:     alexandre@agti-consultoria.com.br');
    console.log('    Cópia:    alexandreclm@gmail.com (Caroline)');
    console.log('    ID:      ', d.id);
  } else {
    console.log('\n❌  Erro:', d.error);
  }
})
.catch(e => console.error('\n❌  Falha de rede:', e.message));
