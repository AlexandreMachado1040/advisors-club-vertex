/**
 * Teste de produção — Advisory Beta (8 módulos completos)
 * node teste_producao_beta.js
 */

const API = 'https://advisors-club-vertex.pages.dev/api/analyze';

// ── Empresa: Studio Aura (mesma do teste MVP) ──
const EMPRESA = 'Studio Aura';

// ── Dados base ──
const RESPOSTAS_M1 = {
  estrategia:          'Abrimos há 4 anos com foco em Pilates. Hoje também oferecemos funcional e yoga, mas sem clareza de qual é nossa proposta de valor central. Não temos planejamento formal. Cada sócia quer coisas diferentes: uma quer crescer em unidades, a outra prefere aprofundar o modelo atual.',
  equipes:             'Temos 8 instrutores, 2 recepcionistas e 1 gerente. Os bons instrutores são disputados por outros studios e a rotatividade é alta. O gerente cuida do dia a dia mas qualquer problema maior chega até nós. Contratamos por indicação.',
  lideranca:           'As duas sócias estão presentes todo dia resolvendo problemas. O gerente executa mas não decide. Se ficamos uma semana fora, os problemas se acumulam.',
  controles:           'Software de gestão de studios para agendamentos. Faturamento controlado, mas não sabemos a margem por modalidade. Churn estimado de 8% ao mês, sem acompanhamento sistemático.',
  cultura:             'Ambiente acolhedor, alunos adoram. Internamente existe tensão quando instrutor cancela aula — sem protocolo claro. Toleramos atrasos de instrutores porque é difícil substituir.',
  produtos:            'Pilates aparelhos (carro-chefe), funcional (baixa rentabilidade), yoga. Programa de emagrecimento de 3 meses funciona bem mas nunca escalamos. Sem produtos digitais.',
  posicao_competitiva: 'Conhecidos pela qualidade dos instrutores e ambiente premium. Têm 3 studios novos cobrando 30% menos. Clientes chegam quase só por indicação e Instagram.',
  modelo_de_negocio:   'Planos mensais (85%) e avulsos (15%). Ticket médio R$350. 120 alunos ativos. Capacidade para 180. Aluguel em shopping = 40% do faturamento. Forte sazonalidade.',
  desafios:            'Reter alunos — muitos cancelam após 3 meses, não sabemos por quê. Instrutores estrela levam alunos quando saem. Sócias esgotadas operacionalmente.'
};

const RESPOSTAS_M2 = {
  p1: 'Os alunos não ficam. Atraímos bem mas retemos mal. Quando tentamos expandir, percebemos que não temos estrutura — dependemos demais de nós mesmas e de dois ou três instrutores-chave.',
  p2: 'Alta rotatividade de alunos sem saber por quê. Instrutores que levam alunos quando saem. Custo fixo alto. Sócias sobrecarregadas.',
  p3: 'Se eu soubesse por que os alunos cancelam e tivesse um modelo onde a fidelização fosse sistêmica — não dependente do carisma de uma instrutora — conseguiria escalar.'
};

const FORCAS_M3 = [
  { nome:'Plataformas digitais de fitness e apps de treino', intensidade:'Forte',    velocidade:'Exponencial',  previsibilidade:'Baixa' },
  { nome:'Commoditização do Pilates (muitos studios novos)', intensidade:'Forte',    velocidade:'Crescente',    previsibilidade:'Alta'  },
  { nome:'Valorização de saúde e bem-estar',                 intensidade:'Forte',    velocidade:'Crescente',    previsibilidade:'Alta'  },
  { nome:'Busca por experiência e comunidade',               intensidade:'Moderada', velocidade:'Crescente',    previsibilidade:'Média' },
  { nome:'Pressão de preço por novos entrantes baratos',     intensidade:'Forte',    velocidade:'Crescente',    previsibilidade:'Alta'  },
  { nome:'IA e personalização de programas de treino',       intensidade:'Disruptiva',velocidade:'Exponencial', previsibilidade:'Baixa' },
];

// Resultados acumulados
let m1, m2, m3, m4;

// ─── helpers ───────────────────────────────────────────
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function call(moduleType, systemPrompt, userMessage, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const t0  = Date.now();
    const res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ systemPrompt, userMessage, moduleType }) });

    if (res.status === 429) {
      const e    = await res.json().catch(()=>({}));
      const base = (e.retryAfter || 30);
      const wait = Math.max(base, attempt * 45) * 1000; // espera crescente: 45s, 90s, 135s
      if (attempt < retries) {
        const secs = Math.round(wait/1000);
        for (let s = secs; s > 0; s--) {
          process.stdout.write(`\r  ⏳  Rate limit (tentativa ${attempt}/${retries}) — aguardando ${s}s…   `);
          await sleep(1000);
        }
        process.stdout.write('\r' + ' '.repeat(60) + '\r');
        continue;
      }
      throw new Error(`Rate limit após ${retries} tentativas (cota esgotada)`);
    }

    if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(`HTTP ${res.status}: ${e.error||'?'}`); }
    const d   = await res.json();
    const raw = d.text ?? d;
    const ms  = Date.now() - t0;
    const p   = typeof raw==='object' ? raw : JSON.parse(
      typeof raw==='string' ? raw.replace(/^```json\n?/,'').replace(/\n?```$/,'').trim() : '{}'
    );
    return { p, ms };
  }
}

function sep(t) { console.log('\n'+'═'.repeat(62)+`\n  ${t}\n`+'═'.repeat(62)); }
const ok   = (l,v) => console.log(`  ✅  ${l}: ${v}`);
const warn = (l,v) => console.log(`  ⚠️   ${l}: ${v}`);
const inf  = (l,v) => console.log(`  ·   ${l}: ${v}`);

// ─── MÓDULO 1 ──────────────────────────────────────────
async function testarM1() {
  sep('MÓDULO 1 — ENTENDER');
  const bloco = Object.entries(RESPOSTAS_M1).map(([k,v])=>`--- ${k.toUpperCase()} ---\n${v}`).join('\n\n');
  const SP = `Analise 9 dimensões e retorne SOMENTE JSON:
{"modulo":"entender","versao_schema":"1.0","empresa":{"nome":"string","segmento":"string","porte_estimado":"pequena|media|grande"},"dimensoes":[{"nome":"estrategia","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"equipes","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"lideranca","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"controles","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"cultura","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"produtos","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"posicao_competitiva","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"modelo_de_negocio","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"desafios","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"}],"sintese":"string","top3_forcas":[{"titulo":"string","descricao":"string"},{"titulo":"string","descricao":"string"},{"titulo":"string","descricao":"string"}],"top3_alertas":[{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"},{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"},{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"}]}`;

  const { p, ms } = await call('entender', SP, `Empresa: ${EMPRESA}\n\n${bloco}`);
  m1 = p;
  ok('Tempo', `${(ms/1000).toFixed(1)}s`);
  ok('Dimensões', `${p.dimensoes?.length}/9`);
  ok('Empresa', `${p.empresa?.nome} | ${p.empresa?.segmento} | ${p.empresa?.porte_estimado}`);
  const crits = p.dimensoes?.filter(d=>d.maturidade==='critico').map(d=>d.nome);
  inf('Críticas', crits?.join(', '));
  inf('Síntese', p.sintese?.slice(0,110)+'…');
  if (p.dimensoes?.length!==9) warn('Dimensões','!=9');
}

// ─── MÓDULO 2 ──────────────────────────────────────────
async function testarM2() {
  sep('MÓDULO 2 — DIAGNOSTICAR');
  const SP = `Separe sintoma de problema real. Formule grande pergunta estratégica. SOMENTE JSON:
{"modulo":"diagnosticar","versao_schema":"1.0","sintoma_declarado":"string","problema_real":"string","distincao_diagnostico_solucao":"string","tese_investigacao":"string","grande_pergunta":"string"}`;
  const dimsCrit = m1.dimensoes?.filter(d=>d.maturidade==='critico').map(d=>d.nome).join(', ');
  const UM = `CONTEXTO M1:\nEmpresa: ${m1.empresa?.nome} | Segmento: ${m1.empresa?.segmento}\nSíntese: ${m1.sintese}\nAlertas: ${m1.top3_alertas?.map(a=>a.titulo).join(', ')}\nDimensões críticas: ${dimsCrit}\n---\nPROBLEMA: ${RESPOSTAS_M2.p1}\nCAMINHO: ${RESPOSTAS_M2.p2}\nIMPEDE VENCER: ${RESPOSTAS_M2.p3}`;
  const { p, ms } = await call('diagnosticar', SP, UM);
  m2 = p;
  ok('Tempo', `${(ms/1000).toFixed(1)}s`);
  ok('Grande pergunta', p.grande_pergunta);
  inf('Problema real', p.problema_real?.slice(0,100)+'…');
  if (!p.grande_pergunta?.endsWith('?')) warn('Grande pergunta','não termina com "?"');
}

// ─── MÓDULO 3 ──────────────────────────────────────────
async function testarM3() {
  sep('MÓDULO 3 — CENÁRIOS');
  const SP = `Selecione 2 eixos de maior incerteza crítica. Gere 4 cenários 2×2. SOMENTE JSON:
{"modulo":"cenarios","versao_schema":"1.0","eixo_1":{"nome":"string","polo_baixo":"string","polo_alto":"string"},"eixo_2":{"nome":"string","polo_baixo":"string","polo_alto":"string"},"cenarios":[{"id":"A","nome":"string","narrativa":"string","consequencias":"string","implicacoes":{"o_que_cresce":"string","o_que_morre":"string","quem_ganha":"string","quem_perde":"string","o_que_muda_no_consumidor":"string"}},{"id":"B","nome":"string","narrativa":"string","consequencias":"string","implicacoes":{"o_que_cresce":"string","o_que_morre":"string","quem_ganha":"string","quem_perde":"string","o_que_muda_no_consumidor":"string"}},{"id":"C","nome":"string","narrativa":"string","consequencias":"string","implicacoes":{"o_que_cresce":"string","o_que_morre":"string","quem_ganha":"string","quem_perde":"string","o_que_muda_no_consumidor":"string"}},{"id":"D","nome":"string","narrativa":"string","consequencias":"string","implicacoes":{"o_que_cresce":"string","o_que_morre":"string","quem_ganha":"string","quem_perde":"string","o_que_muda_no_consumidor":"string"}}]}`;
  const linhas = FORCAS_M3.map(f=>`- ${f.nome} | ${f.intensidade} | ${f.velocidade} | ${f.previsibilidade}`).join('\n');
  const UM = `Segmento: ${m1.empresa?.segmento}\nGrande pergunta: ${m2.grande_pergunta}\n\nFORÇAS:\n${linhas}`;
  const { p, ms } = await call('cenarios', SP, UM);
  m3 = p;
  ok('Tempo', `${(ms/1000).toFixed(1)}s`);
  ok('Cenários', `${p.cenarios?.length}/4`);
  ok('Eixo 1', `${p.eixo_1?.nome}`);
  ok('Eixo 2', `${p.eixo_2?.nome}`);
  p.cenarios?.forEach(c => inf(`[${c.id}] ${c.nome}`, c.narrativa?.slice(0,80)+'…'));
  if (p.cenarios?.length!==4) warn('Cenários','!=4');
}

// ─── MÓDULO 4 ──────────────────────────────────────────
async function testarM4() {
  sep('MÓDULO 4 — OUTPUT');
  const SP = `Gere 4-7 propostas estratégicas priorizadas. SOMENTE JSON:
{"modulo":"output","versao_schema":"1.0","cenarios_considerados":["B","C"],"propostas":[{"numero":1,"titulo":"string","descricao":"string","contexto_estrategico":"string","impacto_esperado":"string","complexidade_implementacao":"alta|media|baixa","dimensoes_afetadas":["string"]}]}`;
  const cenSel = m3.cenarios?.filter(c=>['B','C'].includes(c.id))||[];
  const dimsCrit = m1.dimensoes?.filter(d=>d.maturidade==='critico').map(d=>d.nome)||[];
  const UM = `DIAGNÓSTICO:\nEmpresa: ${m1.empresa?.nome}\nSíntese: ${m1.sintese}\nAlertas: ${m1.top3_alertas?.map(a=>a.titulo).join(', ')}\nDimensões críticas: ${dimsCrit.join(', ')}\n\nPROBLEMA: ${m2.problema_real}\nGRANDE PERGUNTA: ${m2.grande_pergunta}\n\nCENÁRIOS PROVÁVEIS:\n${cenSel.map(c=>`[${c.id}] ${c.nome}: ${c.consequencias}`).join('\n')}`;
  const { p, ms } = await call('output', SP, UM);
  m4 = p;
  ok('Tempo', `${(ms/1000).toFixed(1)}s`);
  ok('Propostas', `${p.propostas?.length}`);
  p.propostas?.forEach(pr => inf(`[${String(pr.numero).padStart(2,'0')}] ${pr.titulo}`, `[${pr.complexidade_implementacao}]`));
  if (p.propostas?.length < 4) warn('Propostas',`apenas ${p.propostas?.length}`);
}

// ─── MÓDULO 5 ──────────────────────────────────────────
async function testarM5() {
  sep('MÓDULO 5 — APROFUNDAR');
  const SP = `Gere 3-5 hipóteses de causa raiz para as dimensões críticas. SOMENTE JSON:
{"modulo":"aprofundar","versao_schema":"1.0","hipoteses":[{"id":1,"dimensao":"string","hipotese":"string","raciocinio":"string"}]}`;
  const dimsCrit = m1.dimensoes?.filter(d=>d.maturidade==='critico')||[];
  const UM = `DIMENSÕES CRÍTICAS:\n${dimsCrit.map(d=>`- ${d.nome}: ${d.diagnostico}`).join('\n')}\n\nPROBLEMA REAL: ${m2.problema_real}\nTESE: ${m2.tese_investigacao}`;
  const { p, ms } = await call('diagnosticar', SP, UM);
  ok('Tempo', `${(ms/1000).toFixed(1)}s`);
  ok('Hipóteses', `${p.hipoteses?.length}`);
  p.hipoteses?.forEach(h => inf(`[${h.dimensao}]`, h.hipotese?.slice(0,90)+'…'));
  if (!p.hipoteses?.length) warn('Hipóteses','nenhuma retornada');
  return p;
}

// ─── MÓDULO 6 ──────────────────────────────────────────
async function testarM6() {
  sep('MÓDULO 6 — MISSÃO E VISÃO');
  const SP = `Gere rascunho de Missão e Visão. Missão: preencha somos/atuamos/valorizamos/diferencial e monte texto_completo fluido. Visão: onde estará em 5 anos, específico e auditável. SOMENTE JSON:
{"modulo":"missao_visao","versao_schema":"1.0","missao":{"somos":"string","atuamos":"string","valorizamos":"string","diferencial":"string","texto_completo":"string"},"visao":{"texto":"string","quando_chegamos":"string"}}`;
  const props = m4.propostas?.slice(0,3).map(pr=>pr.titulo).join(', ');
  const UM = `Empresa: ${m1.empresa?.nome} | Segmento: ${m1.empresa?.segmento}\nSíntese: ${m1.sintese}\nForças: ${m1.top3_forcas?.map(f=>f.titulo).join(', ')}\nPropostas estratégicas: ${props}`;
  const { p, ms } = await call('diagnosticar', SP, UM);
  ok('Tempo', `${(ms/1000).toFixed(1)}s`);
  ok('Missão', p.missao?.texto_completo?.slice(0,120)+'…');
  ok('Visão',  p.visao?.texto?.slice(0,120)+'…');
  if (!p.missao?.texto_completo) warn('Missão','texto_completo ausente');
  if (!p.visao?.texto)           warn('Visão','texto ausente');
  return p;
}

// ─── MÓDULO 7 ──────────────────────────────────────────
async function testarM7() {
  sep('MÓDULO 7 — IMPLICAÇÕES');
  const SP = `Para cada proposta, aplique 3 lentes e gere 2-4 condições mensuráveis. SOMENTE JSON:
{"modulo":"implicacoes","versao_schema":"1.0","por_proposta":[{"proposta_num":1,"proposta_titulo":"string","clientes":["string"],"empresa":["string"],"competidores":["string"]}]}`;
  const propostas = m4.propostas?.slice(0,3)||[];
  const UM = `PROPOSTAS:\n${propostas.map(p=>`[${p.numero}] ${p.titulo}: ${p.descricao}`).join('\n\n')}\n\nGere condições para cada proposta.`;
  const { p, ms } = await call('output', SP, UM);
  ok('Tempo', `${(ms/1000).toFixed(1)}s`);
  ok('Propostas analisadas', `${p.por_proposta?.length}`);
  p.por_proposta?.forEach(pp => {
    inf(`Proposta ${pp.proposta_num}`, pp.proposta_titulo?.slice(0,50));
    inf(`  Clientes`, `${pp.clientes?.length} condições`);
    inf(`  Empresa`,  `${pp.empresa?.length} condições`);
    inf(`  Competidores`, `${pp.competidores?.length} condições`);
  });
  if (!p.por_proposta?.length) warn('Implicações','nenhuma proposta processada');
  return p;
}

// ─── MÓDULO 8 ──────────────────────────────────────────
async function testarM8(m6data) {
  sep('MÓDULO 8 — PLANO DE FUTURO');
  const SP = `Transforme a análise em plano de futuro. Ano 1: 3-5 objetivos com métrica e iniciativas. Anos 2-5: objetivo, o que acontece e como saberemos. SOMENTE JSON:
{"modulo":"plano_futuro","versao_schema":"1.0","ano1":{"objetivos":[{"titulo":"string","metrica":"string","iniciativas":["string"]}]},"horizonte":[{"ano":2,"objetivo":"string","o_que_acontece":"string","como_saberemos":"string"},{"ano":3,"objetivo":"string","o_que_acontece":"string","como_saberemos":"string"},{"ano":4,"objetivo":"string","o_que_acontece":"string","como_saberemos":"string"},{"ano":5,"objetivo":"string","o_que_acontece":"string","como_saberemos":"string"}]}`;
  const props = m4.propostas?.slice(0,5).map(p=>`- ${p.titulo}: ${p.descricao}`).join('\n');
  const UM = `EMPRESA: ${m1.empresa?.nome} | ${m1.empresa?.segmento}\nMISSÃO: ${m6data?.missao?.texto_completo||''}\nVISÃO: ${m6data?.visao?.texto||''}\nGRANDE PERGUNTA: ${m2.grande_pergunta}\nPROPOSTAS:\n${props}`;
  const { p, ms } = await call('output', SP, UM);
  ok('Tempo', `${(ms/1000).toFixed(1)}s`);
  ok('Objetivos Ano 1', `${p.ano1?.objetivos?.length}`);
  ok('Horizonte',       `anos ${p.horizonte?.map(h=>h.ano).join(', ')}`);
  p.ano1?.objetivos?.forEach(o => inf(`  ${o.titulo}`, `Métrica: ${o.metrica?.slice(0,70)}`));
  p.horizonte?.forEach(h => inf(`  Ano ${h.ano}`, h.objetivo?.slice(0,80)));
  if (p.horizonte?.length!==4) warn('Horizonte',`esperado 4 anos, recebido ${p.horizonte?.length}`);
  return p;
}

// ─── MAIN ──────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  Teste Beta Completo — 8 Módulos em Produção`);
  console.log(`    ${API}`);
  // Aguardar 60s para garantir que o rate limit da sessão anterior resetou
  const cooldown = 60;
  for (let s = cooldown; s > 0; s--) {
    process.stdout.write(`\r  ⏸  Cooldown inicial (limite de 20 req/min): ${s}s restantes…   `);
    await sleep(1000);
  }
  process.stdout.write('\r' + ' '.repeat(60) + '\r');
  console.log('  ✔  Pronto. Iniciando testes…\n');

  const resultados = {};
  const tempos     = {};

  const modulos = [
    { nome:'M1 Entender',      fn: async()=>{ await testarM1(); resultados.m1='✅'; } },
    { nome:'M2 Diagnosticar',  fn: async()=>{ await testarM2(); resultados.m2='✅'; } },
    { nome:'M3 Cenários',      fn: async()=>{ await testarM3(); resultados.m3='✅'; } },
    { nome:'M4 Output',        fn: async()=>{ await testarM4(); resultados.m4='✅'; } },
    { nome:'M5 Aprofundar',    fn: async()=>{ await testarM5(); resultados.m5='✅'; } },
    { nome:'M6 Missão e Visão',fn: async()=>{ const d=await testarM6(); resultados.m6='✅'; resultados._m6=d; } },
    { nome:'M7 Implicações',   fn: async()=>{ await testarM7(); resultados.m7='✅'; } },
    { nome:'M8 Plano de Futuro',fn:async()=>{ await testarM8(resultados._m6); resultados.m8='✅'; } },
  ];

  for (let i = 0; i < modulos.length; i++) {
    const mod = modulos[i];
    if (i > 0) {
      process.stdout.write(`  ⏸  Aguardando 8s antes do próximo módulo…`);
      await sleep(8000);
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }
    const t0 = Date.now();
    try {
      await mod.fn();
    } catch(e) {
      console.error(`\n  ❌  ${mod.nome} FALHOU: ${e.message}`);
      resultados[mod.nome] = '❌';
      // Parar se módulo core falhar
      if (['M1 Entender','M2 Diagnosticar','M3 Cenários','M4 Output'].includes(mod.nome)) {
        console.error('  Módulo MVP essencial falhou — abortando.\n'); process.exit(1);
      }
    }
    tempos[mod.nome] = ((Date.now()-t0)/1000).toFixed(1)+'s';
  }

  // ── Relatório final ──────────────────────────────────
  sep('RESULTADO FINAL');
  console.log('');
  const labels = ['M1 Entender','M2 Diagnosticar','M3 Cenários','M4 Output','M5 Aprofundar','M6 Missão e Visão','M7 Implicações','M8 Plano de Futuro'];
  const keys   = ['m1','m2','m3','m4','m5','m6','m7','m8'];
  labels.forEach((l,i) => {
    const st = resultados[keys[i]] || '⏭️ ';
    console.log(`  ${st}  ${l.padEnd(22)} ${tempos[l]||''}`);
  });

  const passou = keys.every(k=>resultados[k]==='✅');
  console.log(`\n  ${passou?'🟢  TODOS OS 8 MÓDULOS PASSARAM':'🔴  ALGUNS MÓDULOS FALHARAM'}`);
  console.log(`\n  📌  Empresa: ${m1?.empresa?.nome} (${m1?.empresa?.segmento})`);
  console.log(`  🔑  Grande pergunta: ${m2?.grande_pergunta?.slice(0,100)}…`);
  console.log(`  🗺️   Cenários: ${m3?.cenarios?.map(c=>`[${c.id}]${c.nome}`).join(' | ')}`);
  console.log(`  📋  Propostas: ${m4?.propostas?.length} geradas`);
  console.log(`  🚀  Endpoint: ${API}\n`);
}

main().catch(e=>{ console.error('\n❌  Erro fatal:', e.message); process.exit(1); });
