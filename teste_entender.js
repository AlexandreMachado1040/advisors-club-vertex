const SYSTEM_PROMPT = `Você é uma consultora estratégica especializada em diagnóstico organizacional para pequenas e médias empresas brasileiras. Trabalha com a metodologia Advisors Club, que analisa empresas em 9 dimensões estratégicas.

Sua missão:
1. Leia o relato de cada dimensão com atenção clínica.
2. Classifique a maturidade: forte | em_desenvolvimento | critico.
3. Diagnóstico analítico por dimensão (2 a 4 frases). Nunca invente dados.
4. Evidência: trecho literal ou paráfrase próxima do relato.
5. Top 3 forças da empresa.
6. Top 3 alertas com urgência.
7. Síntese narrativa de 4 a 6 frases.
8. Infira segmento e porte.

Regras: SOMENTE JSON válido. Sem texto fora. Português brasileiro.

Retorne EXATAMENTE:
{"modulo":"entender","versao_schema":"1.0","empresa":{"nome":"string","segmento":"string","porte_estimado":"pequena|media|grande"},"dimensoes":[{"nome":"estrategia","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"equipes","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"lideranca","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"controles","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"cultura","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"produtos","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"posicao_competitiva","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"modelo_de_negocio","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"},{"nome":"desafios","maturidade":"forte|em_desenvolvimento|critico","diagnostico":"string","evidencia":"string"}],"sintese":"string","top3_forcas":[{"titulo":"string","descricao":"string"},{"titulo":"string","descricao":"string"},{"titulo":"string","descricao":"string"}],"top3_alertas":[{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"},{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"},{"titulo":"string","descricao":"string","urgencia":"alta|media|baixa"}]}`;

const USER_MESSAGE = `Empresa: Nexo Contabilidade

--- ESTRATÉGIA ---
A empresa foi fundada há 8 anos e cresceu principalmente por indicação. Nunca tivemos um planejamento estratégico formal. Sabemos que queremos crescer, mas não definimos claramente em quais segmentos focar. Hoje atendemos desde MEIs até empresas de médio porte sem critério de seleção. Os sócios têm visões diferentes: um quer crescer em volume, o outro prefere especializar em um nicho.

--- EQUIPES ---
Temos 12 colaboradores. A área fiscal funciona bem, temos uma analista sênior que domina tudo. O departamento pessoal é um caos — alta rotatividade, a responsável entrou há 3 meses e ainda está aprendendo. Tudo que é mais complexo ainda passa pelos sócios antes de sair. O time não toma decisões sem aprovação.

--- LIDERANÇA ---
Os dois sócios estão no operacional todo dia. Apagamos incêndio constantemente. Não temos gerentes — as pessoas mais antigas têm autoridade informal mas nenhuma foi formalmente designada como líder. Se um dos sócios tirar férias, a operação trava.

--- CONTROLES ---
Temos o financeiro básico — fluxo de caixa e DRE mensal. Mas não sabemos quanto cada cliente nos custa para atender. Alguns clientes pequenos dão muito trabalho e pagam pouco. Nunca fizemos análise de rentabilidade por cliente. Os prazos são controlados em planilhas que às vezes ficam desatualizadas.

--- CULTURA ---
O ambiente é bom, as pessoas gostam de trabalhar aqui. Mas existe uma cultura de não trazer problemas para os sócios — as pessoas resolvem por conta própria e às vezes erram feio. Toleramos atrasos nas entregas como algo normal. A pontualidade virou um problema crônico que todo mundo já aceitou.

--- PRODUTOS ---
Oferecemos contabilidade completa, departamento pessoal, fiscal e consultoria tributária. A consultoria tributária é a mais rentável mas a menos vendida — ninguém do time comercializa ativamente. A contabilidade básica sustenta o faturamento mas tem margem baixa. Não lançamos nada novo nos últimos 3 anos.

--- POSIÇÃO COMPETITIVA ---
Somos conhecidos pela qualidade técnica e atendimento próximo. Mas cobramos preço médio de mercado e às vezes perdemos clientes para escritórios mais baratos. Nosso diferencial não está claro nem para nós mesmos. Site antigo, redes sociais paradas. Clientes novos chegam quase 100% por indicação.

--- MODELO DE NEGÓCIO ---
Receita recorrente mensal por cliente. Contratos anuais com reajuste pelo IGPM. Ticket médio de R$ 1.800. Temos 90 clientes ativos. Crescimento de uns 8% ao ano em faturamento, mas os custos cresceram mais rápido. Não temos produto de entrada nem produto premium.

--- DESAFIOS ---
O principal problema é a dependência dos sócios para tudo. Qualquer cliente com dúvida mais complexa liga direto para nós. Não conseguimos escalar porque o gargalo somos nós mesmos. Além disso, estamos perdendo clientes para fintechs de contabilidade que cobram menos. Não sabemos como nos diferenciar delas além do atendimento pessoal.

Produza o diagnóstico estratégico completo.`;

async function teste() {
  console.log('🔄  Enviando para análise...\n');

  const t0 = Date.now();
  const res = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: SYSTEM_PROMPT,
      userMessage:  USER_MESSAGE,
      moduleType:   'entender'
    })
  });

  const data = await res.json();
  const ms   = Date.now() - t0;

  if (!res.ok) {
    console.error('❌  Erro:', data);
    return;
  }

  const raw = data.text ?? data;
  let parsed;
  try {
    parsed = typeof raw === 'object' ? raw : JSON.parse(raw);
  } catch(e) {
    console.error('❌  JSON inválido retornado pela IA:\n', raw);
    return;
  }

  console.log(`✅  Análise concluída em ${(ms/1000).toFixed(1)}s\n`);
  console.log('═══ EMPRESA ═══');
  console.log(`Nome:    ${parsed.empresa?.nome}`);
  console.log(`Segmento: ${parsed.empresa?.segmento}`);
  console.log(`Porte:   ${parsed.empresa?.porte_estimado}\n`);

  console.log('═══ SÍNTESE ═══');
  console.log(parsed.sintese + '\n');

  console.log('═══ DIMENSÕES ═══');
  const icons = { forte: '🟢', em_desenvolvimento: '🟡', critico: '🔴' };
  for (const d of parsed.dimensoes || []) {
    console.log(`${icons[d.maturidade] || '⚪'} ${d.nome.toUpperCase()} [${d.maturidade}]`);
    console.log(`   ${d.diagnostico}`);
  }

  console.log('\n═══ TOP 3 FORÇAS ═══');
  for (const f of parsed.top3_forcas || []) {
    console.log(`✦ ${f.titulo}: ${f.descricao}`);
  }

  console.log('\n═══ TOP 3 ALERTAS ═══');
  const urg = { alta: '🔴', media: '🟡', baixa: '🟢' };
  for (const a of parsed.top3_alertas || []) {
    console.log(`${urg[a.urgencia]} [${a.urgencia.toUpperCase()}] ${a.titulo}: ${a.descricao}`);
  }

  console.log('\n═══ JSON COMPLETO ═══');
  console.log(JSON.stringify(parsed, null, 2));
}

teste().catch(console.error);
