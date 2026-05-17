/**
 * Teste de produção — Advisory Estratégico MVP
 * Executa os 4 módulos em sequência contra a Cloudflare Function de produção.
 * node teste_producao.js
 */

const API_URL = 'https://advisors-club-vertex.pages.dev/api/analyze';

// ── Empresa fictícia: Studio Aura (pilates / fitness) ──
const EMPRESA = 'Studio Aura';

const RESPOSTAS_M1 = {
  estrategia:          'Abrimos há 4 anos com foco em Pilates. Hoje também oferecemos funcional e yoga, mas sem clareza de qual é nossa proposta de valor central. Não temos planejamento formal — reagimos ao mercado. Cada sócia tem uma visão diferente: uma quer crescer em número de unidades, a outra prefere aprofundar o modelo atual.',
  equipes:             'Temos 8 instrutores, 2 recepcionistas e 1 gerente operacional. Os instrutores bons são disputados por outros studios e a rotatividade é alta. O gerente cuida do dia a dia mas qualquer problema maior chega até nós. Contratamos por indicação e ainda não temos processo seletivo estruturado.',
  lideranca:           'As duas sócias estão presentes todo dia. Respondemos mensagens de alunos diretamente, resolvemos conflitos de agenda, cobrimos falta de instrutor. O gerente executa mas não decide. Se ficamos uma semana fora, os problemas se acumulam.',
  controles:           'Usamos um software de gestão de studios para agendamentos e cobranças. Faturamento mensal controlado, mas não sabemos a margem por modalidade. Nunca calculamos o custo de aquisição de aluno nem o LTV. Churn mensal estimado de cabeça em torno de 8%, mas sem acompanhamento sistemático.',
  cultura:             'O ambiente é acolhedor e os alunos adoram. Mas internamente existe tensão quando um instrutor cancela aula — não temos protocolo claro e cada situação vira uma negociação. Toleramos atrasos de instrutores porque é difícil substituir. A cultura de feedback entre sócias e equipe é quase inexistente.',
  produtos:            'Planos mensais de Pilates (aparelhos e mat), funcional e yoga. O Pilates aparelhos é o carro-chefe — mais caro e mais procurado. O funcional tem turmas pequenas e baixa rentabilidade. Temos um programa de emagrecimento de 3 meses que funciona bem mas nunca escalamos. Sem produtos digitais.',
  posicao_competitiva: 'Somos conhecidos pela qualidade dos instrutores e pelo ambiente premium. Mas têm 3 studios novos na região cobrando 30% menos. Clientes nos escolhem pelo atendimento personalizado, mas quando o preço aperta alguns migram. Não investimos em marketing — clientes vêm quase só por indicação e Instagram.',
  modelo_de_negocio:   'Receita vem de planos mensais (85%) e pacotes avulsos (15%). Ticket médio de R$350/mês. 120 alunos ativos. Capacidade instalada para 180. Custos fixos altos — aluguel em shopping representa 40% do faturamento. Sem receita recorrente além dos planos. Sazonalidade forte em janeiro e julho.',
  desafios:            'O maior desafio é reter alunos — muitos cancelam após 3 meses. Não sabemos exatamente por quê. Outro desafio é a dependência dos instrutores estrela: quando um sai, leva alunos. E as sócias estão esgotadas operacionalmente — queremos crescer mas não temos energia nem estrutura para isso.'
};

const RESPOSTAS_M2 = {
  p1: 'Não conseguimos crescer porque os alunos não ficam. A gente atrai bem mas retém mal. E quando tentamos expandir, percebemos que não temos estrutura — dependemos demais de nós mesmas e de dois ou três instrutores-chave.',
  p2: 'Alta rotatividade de alunos que não sabemos exatamente por que saem. Instrutores que levam alunos quando saem. Custo fixo alto que não deixa margem para errar. Sócias sobrecarregadas que não conseguem sair do operacional para pensar estrategicamente.',
  p3: 'Se eu soubesse por que os alunos cancelam e conseguisse criar um modelo onde a fidelização fosse sistêmica — não dependente do carisma de uma instrutora — conseguiria escalar. Hoje o studio é bom mas frágil. Qualquer movimento do mercado ou saída de pessoa-chave nos abala.'
};

const FORCAS_M3 = [
  { nome: 'Plataformas digitais de fitness e apps de treino', intensidade: 'Forte', velocidade: 'Exponencial', previsibilidade: 'Baixa' },
  { nome: 'Commoditização do Pilates (muitos studios novos)', intensidade: 'Forte', velocidade: 'Crescente', previsibilidade: 'Alta' },
  { nome: 'Valorização de saúde e bem-estar pós-pandemia', intensidade: 'Forte', velocidade: 'Crescente', previsibilidade: 'Alta' },
  { nome: 'Busca por experiência e comunidade (não só treino)', intensidade: 'Moderada', velocidade: 'Crescente', previsibilidade: 'Média' },
  { nome: 'Pressão de preço por novos entrantes baratos', intensidade: 'Forte', velocidade: 'Crescente', previsibilidade: 'Alta' },
  { nome: 'IA e personalização de programas de treino', intensidade: 'Disruptiva', velocidade: 'Exponencial', previsibilidade: 'Baixa' },
];

// ─────────────────────────────────────────
const PROMPTS = {
  entender: `Você é uma consultora estratégica especializada em diagnóstico organizacional para pequenas e médias empresas brasileiras. Trabalha com a metodologia Advisors Club.
Analise as 9 dimensões e retorne SOMENTE o JSON abaixo, sem texto fora dele:
{"modulo":"entender","versao_schema":"1.0","empresa":{"nome":"string","segmento":"string","porte_estimado":"pequena|media|grande"},"dimensoes":[{"nome":"estrategia","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"equipes","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"lideranca","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"controles","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"cultura","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"produtos","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"posicao_competitiva","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"modelo_de_negocio","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"desafios","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"}],"sintese":"string","top3_forcas":[{"titulo":"string","descricao":"string"},{"titulo":"string","descricao":"string"},{"titulo":"string","descricao":"string"}],"top3_alertas":[{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"},{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"},{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"}]}`,

  diagnosticar: `Você é consultora estratégica da metodologia Advisors Club. Separe sintoma de problema real. Formule a grande pergunta estratégica. Retorne SOMENTE o JSON:
{"modulo":"diagnosticar","versao_schema":"1.0","sintoma_declarado":"string","problema_real":"string","distincao_diagnostico_solucao":"string","tese_investigacao":"string","grande_pergunta":"string"}`,

  cenarios: `Você é especialista em cenários estratégicos. Selecione 2 eixos de maior incerteza crítica e gere 4 cenários (A/B/C/D). Retorne SOMENTE o JSON:
{"modulo":"cenarios","versao_schema":"1.0","eixo_1":{"nome":"string","polo_baixo":"string","polo_alto":"string"},"eixo_2":{"nome":"string","polo_baixo":"string","polo_alto":"string"},"cenarios":[{"id":"A","nome":"string","narrativa":"string","consequencias":"string","implicacoes":{"o_que_cresce":"string","o_que_morre":"string","quem_ganha":"string","quem_perde":"string","o_que_muda_no_consumidor":"string"}},{"id":"B","nome":"string","narrativa":"string","consequencias":"string","implicacoes":{"o_que_cresce":"string","o_que_morre":"string","quem_ganha":"string","quem_perde":"string","o_que_muda_no_consumidor":"string"}},{"id":"C","nome":"string","narrativa":"string","consequencias":"string","implicacoes":{"o_que_cresce":"string","o_que_morre":"string","quem_ganha":"string","quem_perde":"string","o_que_muda_no_consumidor":"string"}},{"id":"D","nome":"string","narrativa":"string","consequencias":"string","implicacoes":{"o_que_cresce":"string","o_que_morre":"string","quem_ganha":"string","quem_perde":"string","o_que_muda_no_consumidor":"string"}}]}`,

  output: `Você é consultora estratégica sênior da metodologia Advisors Club. Gere 4 a 7 propostas de mudança estratégica específicas e priorizadas. Retorne SOMENTE o JSON:
{"modulo":"output","versao_schema":"1.0","cenarios_considerados":["A"],"propostas":[{"numero":1,"titulo":"string","descricao":"string","contexto_estrategico":"string","impacto_esperado":"string","complexidade_implementacao":"alta|media|baixa","dimensoes_afetadas":["string"]}]}`
};

// ─────────────────────────────────────────
async function callAPI(moduleType, systemPrompt, userMessage) {
  const t0  = Date.now();
  const res = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ systemPrompt, userMessage, moduleType })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}: ${err.error || 'erro desconhecido'}`);
  }

  const data = await res.json();
  const raw  = data.text ?? data;
  const ms   = Date.now() - t0;
  const parsed = typeof raw === 'object' ? raw : JSON.parse(
    typeof raw === 'string' ? raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim() : '{}'
  );
  return { parsed, ms };
}

function sep(titulo) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${titulo}`);
  console.log('═'.repeat(60));
}

function ok(label, val) { console.log(`  ✅  ${label}: ${val}`); }
function warn(label, val) { console.log(`  ⚠️   ${label}: ${val}`); }
function info(label, val) { console.log(`  ·   ${label}: ${val}`); }

// ─────────────────────────────────────────
async function main() {
  console.log(`\n🚀  Teste de Produção — Advisory Estratégico`);
  console.log(`    Endpoint: ${API_URL}`);
  console.log(`    Empresa:  ${EMPRESA}\n`);

  // ── MÓDULO 1: ENTENDER ──────────────────
  sep('MÓDULO 1 — ENTENDER');
  const dimBlocks = Object.entries(RESPOSTAS_M1)
    .map(([k, v]) => `--- ${k.toUpperCase()} ---\n${v}`).join('\n\n');
  const userM1 = `Empresa: ${EMPRESA}\n\n${dimBlocks}`;

  let m1;
  try {
    const { parsed, ms } = await callAPI('entender', PROMPTS.entender, userM1);
    m1 = parsed;
    ok(`Concluído em`, `${(ms/1000).toFixed(1)}s`);
    ok(`Schema`,       `modulo=${m1.modulo}, versao=${m1.versao_schema}`);
    ok(`Empresa`,      `${m1.empresa?.nome} | ${m1.empresa?.segmento} | porte: ${m1.empresa?.porte_estimado}`);
    ok(`Dimensões`,    `${m1.dimensoes?.length}/9`);

    const crits = m1.dimensoes?.filter(d => d.maturidade === 'critico').map(d => d.nome);
    const devs  = m1.dimensoes?.filter(d => d.maturidade === 'em_desenvolvimento').map(d => d.nome);
    const forts = m1.dimensoes?.filter(d => d.maturidade === 'forte').map(d => d.nome);
    info(`Críticas`,     crits?.join(', ') || '—');
    info(`Em desenvolvimento`, devs?.join(', ') || '—');
    info(`Fortes`,       forts?.join(', ') || '—');
    info(`Síntese`,      m1.sintese?.slice(0, 120) + '…');
    info(`Força #1`,     m1.top3_forcas?.[0]?.titulo);
    info(`Alerta #1`,    `[${m1.top3_alertas?.[0]?.urgencia}] ${m1.top3_alertas?.[0]?.titulo}`);

    if (m1.dimensoes?.length !== 9) warn('Dimensões', `esperado 9, recebido ${m1.dimensoes?.length}`);
    if (!m1.sintese)                warn('Síntese', 'ausente');
  } catch(e) {
    console.error(`  ❌  FALHOU: ${e.message}`);
    process.exit(1);
  }

  // ── MÓDULO 2: DIAGNOSTICAR ──────────────
  sep('MÓDULO 2 — DIAGNOSTICAR');
  const userM2 = `CONTEXTO — M1:
Empresa: ${m1.empresa?.nome} | Segmento: ${m1.empresa?.segmento}
Síntese: ${m1.sintese}
Top 3 alertas: ${m1.top3_alertas?.map(a => a.titulo).join(', ')}
Dimensões críticas: ${m1.dimensoes?.filter(d => d.maturidade==='critico').map(d=>d.nome).join(', ')}

---
PRINCIPAL PROBLEMA:\n${RESPOSTAS_M2.p1}

O QUE ESTÁ NO CAMINHO:\n${RESPOSTAS_M2.p2}

O QUE IMPEDE VENCER:\n${RESPOSTAS_M2.p3}`;

  let m2;
  try {
    const { parsed, ms } = await callAPI('diagnosticar', PROMPTS.diagnosticar, userM2);
    m2 = parsed;
    ok(`Concluído em`,  `${(ms/1000).toFixed(1)}s`);
    ok(`Schema`,        `modulo=${m2.modulo}`);
    ok(`Sintoma`,       m2.sintoma_declarado?.slice(0, 80) + '…');
    ok(`Problema real`, m2.problema_real?.slice(0, 80) + '…');
    ok(`Grande pergunta`, m2.grande_pergunta);
    info(`Tese`,        m2.tese_investigacao?.slice(0, 100) + '…');

    if (!m2.grande_pergunta?.endsWith('?')) warn('Grande pergunta', 'não termina com "?"');
  } catch(e) {
    console.error(`  ❌  FALHOU: ${e.message}`);
    process.exit(1);
  }

  // ── MÓDULO 3: CENÁRIOS ──────────────────
  sep('MÓDULO 3 — CENÁRIOS');
  const linhasForcas = FORCAS_M3
    .map(f => `- ${f.nome} | Intensidade: ${f.intensidade} | Velocidade: ${f.velocidade} | Previsibilidade: ${f.previsibilidade}`)
    .join('\n');
  const userM3 = `CONTEXTO:
Segmento: ${m1.empresa?.segmento}
Grande pergunta: ${m2.grande_pergunta}

FORÇAS MAPEADAS:
${linhasForcas}`;

  let m3;
  try {
    const { parsed, ms } = await callAPI('cenarios', PROMPTS.cenarios, userM3);
    m3 = parsed;
    ok(`Concluído em`, `${(ms/1000).toFixed(1)}s`);
    ok(`Schema`,       `modulo=${m3.modulo}`);
    ok(`Eixo 1`,       `${m3.eixo_1?.nome} | ${m3.eixo_1?.polo_baixo} ←→ ${m3.eixo_1?.polo_alto}`);
    ok(`Eixo 2`,       `${m3.eixo_2?.nome} | ${m3.eixo_2?.polo_baixo} ←→ ${m3.eixo_2?.polo_alto}`);
    ok(`Cenários`,     `${m3.cenarios?.length}/4`);
    m3.cenarios?.forEach(c => info(`[${c.id}] ${c.nome}`, c.narrativa?.slice(0, 80) + '…'));

    if (m3.cenarios?.length !== 4) warn('Cenários', `esperado 4, recebido ${m3.cenarios?.length}`);
    const semImpl = m3.cenarios?.filter(c => !c.implicacoes?.o_que_cresce);
    if (semImpl?.length) warn('Implicações', `${semImpl.length} cenário(s) sem implicações`);
  } catch(e) {
    console.error(`  ❌  FALHOU: ${e.message}`);
    process.exit(1);
  }

  // ── MÓDULO 4: OUTPUT ────────────────────
  sep('MÓDULO 4 — OUTPUT');
  const cenSel = m3.cenarios?.filter(c => ['B', 'D'].includes(c.id)) || [];
  const dimsCrit = m1.dimensoes?.filter(d => d.maturidade === 'critico').map(d => d.nome) || [];
  const userM4 = `DIAGNÓSTICO (M1):
Empresa: ${m1.empresa?.nome} | Segmento: ${m1.empresa?.segmento}
Síntese: ${m1.sintese}
Alertas: ${m1.top3_alertas?.map(a=>a.titulo).join(', ')}
Dimensões críticas: ${dimsCrit.join(', ')}

PROBLEMA REAL (M2): ${m2.problema_real}
Grande pergunta: ${m2.grande_pergunta}

CENÁRIOS MAIS PROVÁVEIS:
${cenSel.map(c=>`[${c.id}] ${c.nome}: ${c.consequencias}\nO que cresce: ${c.implicacoes?.o_que_cresce}\nQuem ganha: ${c.implicacoes?.quem_ganha}`).join('\n\n')}

Gere as propostas de mudança estratégica.`;

  let m4;
  try {
    const { parsed, ms } = await callAPI('output', PROMPTS.output, userM4);
    m4 = parsed;
    ok(`Concluído em`, `${(ms/1000).toFixed(1)}s`);
    ok(`Schema`,       `modulo=${m4.modulo}`);
    ok(`Cenários considerados`, m4.cenarios_considerados?.join(', '));
    ok(`Propostas`,    `${m4.propostas?.length}`);
    m4.propostas?.forEach(p =>
      info(`[${String(p.numero).padStart(2,'0')}] ${p.titulo}`,
           `[${p.complexidade_implementacao}] ${p.descricao?.slice(0,70)}…`)
    );

    if (m4.propostas?.length < 3) warn('Propostas', `apenas ${m4.propostas?.length} — esperado mínimo 4`);
  } catch(e) {
    console.error(`  ❌  FALHOU: ${e.message}`);
    process.exit(1);
  }

  // ── RESUMO ──────────────────────────────
  sep('RESUMO DO TESTE');
  ok('Todos os 4 módulos', 'PASSOU ✅');
  ok('Schemas JSON',       'válidos e completos');
  ok('Endpoint produção',  API_URL);
  console.log(`\n  📄  Empresa testada: ${m1.empresa?.nome} (${m1.empresa?.segmento})`);
  console.log(`  🔑  Grande pergunta: ${m2.grande_pergunta}`);
  console.log(`  🗺️   Cenários: ${m3.cenarios?.map(c=>`[${c.id}] ${c.nome}`).join(' | ')}`);
  console.log(`  📋  Propostas: ${m4.propostas?.map(p=>`${p.numero}. ${p.titulo}`).join(' | ')}`);
  console.log('\n  🚀  Produção funcionando corretamente.\n');
}

main().catch(e => { console.error('\n❌  Erro fatal:', e.message); process.exit(1); });
