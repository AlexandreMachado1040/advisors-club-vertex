# Fluxo de Metodologia — Plataforma Advisory IA

> Documentação técnica dos 8 módulos da plataforma. Descreve o que o mentorado fornece, o que a IA recebe como contexto, o que ela processa e o schema exato de output de cada módulo.

---

## Visão Geral

| # | Módulo | Fase | Depende de |
|---|--------|------|------------|
| 1 | Entender | MVP | — |
| 2 | Diagnosticar | MVP | Entender |
| 3 | Cenários | MVP | Diagnosticar, Entender |
| 4 | Output | MVP | Entender, Diagnosticar, Cenários |
| 5 | Aprofundar | Beta | Entender, Diagnosticar |
| 6 | Missão e Visão | Beta | Entender, Output |
| 7 | Implicações | Beta | Output, Cenários |
| 8 | Plano de Futuro | Beta | Todos anteriores |

---

## Módulo 1 — Entender

| Campo | Valor |
|-------|-------|
| **ID** | `modulo_01_entender` |
| **Nome** | Entender |
| **Fase** | MVP |
| **Objetivo** | Mapear o estado atual da empresa nas 9 dimensões estratégicas e sintetizar forças e alertas críticos. |

### Input do Usuário

O mentorado responde em texto livre a perguntas abertas para cada uma das 9 dimensões abaixo. Não há formato fixo — o sistema aceita parágrafos corridos.

| Dimensão | O que o mentorado descreve |
|----------|--------------------------|
| Estratégia | Direção atual, metas, clareza do norte |
| Equipes | Composição, performance, gaps de pessoas |
| Liderança | Perfil dos líderes, estilo decisório |
| Controles | Métricas, financeiro, processos de monitoramento |
| Cultura | Valores praticados, ambiente, comportamentos |
| Produtos | Portfólio, posicionamento da oferta |
| Posição competitiva | Diferencial, percepção de mercado, concorrência |
| Modelo de negócio | Como gera, entrega e captura valor |
| Desafios | Principais obstáculos e riscos percebidos |

### Dados Contextuais Recebidos

Nenhum. Este é o módulo inaugural — a IA opera exclusivamente com o input do usuário.

### Processamento IA

1. Analisa o texto de cada dimensão individualmente.
2. Classifica a maturidade de cada dimensão: `forte` | `em_desenvolvimento` | `critico`.
3. Identifica os 3 maiores pontos de força transversais às dimensões.
4. Identifica os 3 maiores alertas estratégicos.
5. Gera síntese narrativa integrando as 9 dimensões em um diagnóstico coeso.
6. Extrai o segmento/setor da empresa a partir do input (usado como contexto contextual nos módulos seguintes).

### Output JSON

```typescript
{
  modulo: "entender",
  versao_schema: "1.0",
  empresa: {
    nome: string,
    segmento: string,          // ex: "varejo", "tech B2B", "educação"
    porte_estimado: string     // ex: "pequena", "média", "grande"
  },
  dimensoes: [
    {
      nome: "estrategia" | "equipes" | "lideranca" | "controles" |
            "cultura" | "produtos" | "posicao_competitiva" |
            "modelo_de_negocio" | "desafios",
      maturidade: "forte" | "em_desenvolvimento" | "critico",
      diagnostico: string,     // 2–4 frases analíticas
      evidencia: string        // trecho literal do input que fundamenta o diagnóstico
    }
    // ... 9 itens no total
  ],
  sintese: string,             // parágrafo de 4–6 frases integrando as dimensões
  top3_forcas: [
    {
      titulo: string,
      descricao: string
    }
    // ... 3 itens
  ],
  top3_alertas: [
    {
      titulo: string,
      descricao: string,
      urgencia: "alta" | "media" | "baixa"
    }
    // ... 3 itens
  ]
}
```

### O que Flui para o Próximo Módulo

| Campo exportado | Usado em |
|----------------|----------|
| `empresa.segmento` | Módulo 3 (Cenários) |
| `sintese` | Módulos 2, 6 |
| `top3_alertas` | Módulos 2, 5 |
| `top3_forcas` | Módulos 4, 8 |
| `dimensoes[*].maturidade` | Módulos 4, 8 |

---

## Módulo 2 — Diagnosticar

| Campo | Valor |
|-------|-------|
| **ID** | `modulo_02_diagnosticar` |
| **Nome** | Diagnosticar |
| **Fase** | MVP |
| **Objetivo** | Formular a tese de investigação, isolar o problema real e enunciar a grande pergunta estratégica que orientará os próximos módulos. |

### Input do Usuário

O mentorado responde três perguntas em texto livre:

1. **Qual é o principal problema que você enfrenta hoje?**
2. **O que está no caminho — o que impede o avanço?**
3. **O que impede você de vencer?**

### Dados Contextuais Recebidos

| Campo | Origem |
|-------|--------|
| `sintese` | Módulo 1 — Entender |
| `top3_alertas` | Módulo 1 — Entender |

### Processamento IA

1. Lê o input do mentorado à luz da síntese e dos alertas do Módulo 1.
2. Distingue o **sintoma** (o que o mentorado nomeou) do **problema real** (causa sistêmica subjacente).
3. Separa explicitamente diagnóstico de solução — a IA não propõe respostas nesta etapa.
4. Formula a **tese de investigação**: hipótese sobre o que está de fato acontecendo na empresa.
5. Enuncia a **grande pergunta estratégica**: a questão central que, respondida, desbloquearia o crescimento.

### Output JSON

```typescript
{
  modulo: "diagnosticar",
  versao_schema: "1.0",
  sintoma_declarado: string,           // o que o mentorado disse ser o problema
  problema_real: string,               // diagnóstico da IA — causa raiz
  distincao_diagnostico_solucao: string, // nota explicando por que o que o mentorado descreveu
                                          // é sintoma, não causa
  tese_investigacao: string,           // hipótese analítica em 2–4 frases
  grande_pergunta: string              // 1 pergunta estratégica central, formulada como questão aberta
}
```

### O que Flui para o Próximo Módulo

| Campo exportado | Usado em |
|----------------|----------|
| `grande_pergunta` | Módulo 3 (Cenários) |
| `problema_real` | Módulos 4, 5 |
| `tese_investigacao` | Módulos 4, 5 |

---

## Módulo 3 — Cenários

| Campo | Valor |
|-------|-------|
| **ID** | `modulo_03_cenarios` |
| **Nome** | Cenários |
| **Fase** | MVP |
| **Objetivo** | Construir uma matriz 2×2 de cenários futuros a partir das forças externas mais críticas identificadas pelo mentorado. |

### Input do Usuário

O mentorado avalia uma lista de **5 a 10 forças externas** (tendências, pressões de mercado, movimentos competitivos) em três eixos:

| Atributo | Opções |
|----------|--------|
| **Intensidade** | `Fraca` \| `Moderada` \| `Forte` \| `Disruptiva` |
| **Velocidade** | `Lenta` \| `Crescente` \| `Exponencial` |
| **Previsibilidade** | `Alta` \| `Média` \| `Baixa` |

O mentorado nomeia cada força e atribui as três avaliações. Exemplo de linha: `"Regulamentação de IA" — Forte / Crescente / Baixa`.

### Dados Contextuais Recebidos

| Campo | Origem |
|-------|--------|
| `grande_pergunta` | Módulo 2 — Diagnosticar |
| `empresa.segmento` | Módulo 1 — Entender |

### Processamento IA

1. Analisa o conjunto de forças considerando intensidade × velocidade × previsibilidade.
2. Seleciona os **2 eixos de maior incerteza crítica** (alta intensidade + baixa previsibilidade), que formarão os eixos da matriz.
3. Gera os **4 cenários** resultantes da combinação dos extremos de cada eixo (matriz 2×2).
4. Para cada cenário, desenvolve narrativa e implicações estratégicas detalhadas.
5. Mantém coerência com a `grande_pergunta` — os cenários devem iluminar caminhos de resposta a ela.

### Output JSON

```typescript
{
  modulo: "cenarios",
  versao_schema: "1.0",
  eixo_1: {
    nome: string,              // ex: "Velocidade de adoção digital"
    polo_baixo: string,        // ex: "Adoção lenta"
    polo_alto: string          // ex: "Adoção acelerada"
  },
  eixo_2: {
    nome: string,
    polo_baixo: string,
    polo_alto: string
  },
  cenarios: [
    {
      id: "A" | "B" | "C" | "D",  // A=eixo1_baixo+eixo2_baixo, B=eixo1_alto+eixo2_baixo,
                                   // C=eixo1_baixo+eixo2_alto, D=eixo1_alto+eixo2_alto
      nome: string,
      narrativa: string,           // 3–5 frases descrevendo o mundo nesse cenário
      consequencias: string,       // impacto direto sobre o segmento da empresa
      implicacoes: {
        o_que_cresce: string,
        o_que_morre: string,
        quem_ganha: string,
        quem_perde: string,
        o_que_muda_no_consumidor: string
      }
    }
    // ... 4 itens (A, B, C, D)
  ]
}
```

### O que Flui para o Próximo Módulo

| Campo exportado | Usado em |
|----------------|----------|
| `eixo_1`, `eixo_2` | Módulos 4, 7, 8 |
| `cenarios[*]` (array completo) | Módulos 4, 7, 8 |

---

## Módulo 4 — Output

| Campo | Valor |
|-------|-------|
| **ID** | `modulo_04_output` |
| **Nome** | Output |
| **Fase** | MVP |
| **Objetivo** | Gerar propostas de mudança estratégica numeradas e priorizadas, ancoradas nos cenários considerados mais prováveis pelo mentorado. |

### Input do Usuário

O mentorado seleciona, entre os 4 cenários gerados no Módulo 3, **quais considera mais prováveis** (pode selecionar 1 a 3 cenários). A seleção é feita por interface (checkbox ou botão) — não requer texto livre.

### Dados Contextuais Recebidos

| Campo | Origem |
|-------|--------|
| `dimensoes[*]` (diagnóstico completo) | Módulo 1 — Entender |
| `top3_forcas`, `top3_alertas` | Módulo 1 — Entender |
| `problema_real`, `tese_investigacao` | Módulo 2 — Diagnosticar |
| `grande_pergunta` | Módulo 2 — Diagnosticar |
| `cenarios[*]` (array completo) | Módulo 3 — Cenários |
| IDs dos cenários selecionados pelo mentorado | Input atual |

### Processamento IA

1. Filtra os cenários marcados como prováveis e extrai suas implicações.
2. Cruza as implicações dos cenários com os alertas e o problema real identificados nos módulos anteriores.
3. Gera propostas de mudança específicas, ordenadas por relevância estratégica.
4. Para cada proposta, avalia a complexidade de implementação com base no diagnóstico organizacional do Módulo 1.
5. Garante que cada proposta responda, direta ou indiretamente, à `grande_pergunta` do Módulo 2.

### Output JSON

```typescript
{
  modulo: "output",
  versao_schema: "1.0",
  cenarios_considerados: string[],    // IDs dos cenários selecionados (ex: ["A", "C"])
  propostas: [
    {
      numero: number,                 // sequencial, começa em 1
      titulo: string,
      descricao: string,              // o que deve ser feito e como
      contexto_estrategico: string,   // por que essa proposta importa — ligação com diagnóstico/cenários
      impacto_esperado: string,       // resultado concreto esperado
      complexidade_implementacao: "alta" | "media" | "baixa",
      dimensoes_afetadas: string[]    // nomes das dimensões do Módulo 1 impactadas
    }
    // ... mínimo 3, máximo 8 propostas
  ]
}
```

### O que Flui para o Próximo Módulo

| Campo exportado | Usado em |
|----------------|----------|
| `propostas[*]` (array completo) | Módulos 6, 7, 8 |
| `cenarios_considerados` | Módulos 7, 8 |

---

## Módulo 5 — Aprofundar *(Beta)*

| Campo | Valor |
|-------|-------|
| **ID** | `modulo_05_aprofundar` |
| **Nome** | Aprofundar |
| **Fase** | Beta |
| **Objetivo** | Formular hipóteses de causa raiz para os desafios críticos e refinar a tese de investigação com base na validação do mentorado. |

### Input do Usuário

O mentorado valida ou ajusta hipóteses apresentadas pela IA sobre cada desafio crítico. A interação é guiada: para cada hipótese exibida, o mentorado pode:

- **Confirmar** — a hipótese está correta
- **Ajustar** — modificar o enunciado em texto livre
- **Descartar** — a hipótese não se aplica

### Dados Contextuais Recebidos

| Campo | Origem |
|-------|--------|
| `top3_alertas` | Módulo 1 — Entender |
| `problema_real` | Módulo 2 — Diagnosticar |
| `tese_investigacao` | Módulo 2 — Diagnosticar |

### Processamento IA

1. Para cada alerta crítico do Módulo 1, gera hipóteses de causa raiz usando raciocínio de 5 Porquês implícito.
2. Apresenta as hipóteses ao mentorado para validação.
3. Incorpora os ajustes do mentorado e reprocessa.
4. Refina a tese de investigação original do Módulo 2 com o novo nível de detalhamento.

### Output JSON

```typescript
{
  modulo: "aprofundar",
  versao_schema: "1.0",
  hipoteses_causa_raiz: [
    {
      alerta_origem: string,         // titulo do alerta do Módulo 1
      hipotese: string,              // enunciado da hipótese refinada
      status_validacao: "confirmada" | "ajustada" | "descartada",
      ajuste_mentorado: string | null  // texto do ajuste, se aplicável
    }
    // ... um item por alerta crítico
  ],
  tese_investigacao_refinada: string  // versão atualizada da tese do Módulo 2
}
```

### O que Flui para o Próximo Módulo

| Campo exportado | Usado em |
|----------------|----------|
| `hipoteses_causa_raiz` | Módulo 8 |
| `tese_investigacao_refinada` | Módulo 8 |

---

## Módulo 6 — Missão e Visão *(Beta)*

| Campo | Valor |
|-------|-------|
| **ID** | `modulo_06_missao_visao` |
| **Nome** | Missão e Visão |
| **Fase** | Beta |
| **Objetivo** | Co-criar com o mentorado os enunciados de missão e visão da empresa, ancorados no diagnóstico estratégico. |

### Input do Usuário

O mentorado responde a dois blocos de perguntas em texto livre:

**Bloco Missão:**
- Somos... *(quem a empresa é)*
- Atuamos... *(onde e com quem)*
- Valorizamos... *(princípios que guiam a operação)*
- Diferencial... *(o que nos distingue da concorrência)*

**Bloco Visão:**
- Onde a empresa estará em 5 anos? *(descrição de futuro desejado)*

Após geração do rascunho pela IA, o mentorado pode editar livremente os enunciados antes de confirmar.

### Dados Contextuais Recebidos

| Campo | Origem |
|-------|--------|
| `sintese` | Módulo 1 — Entender |
| `top3_forcas` | Módulo 1 — Entender |
| `propostas[*]` | Módulo 4 — Output |

### Processamento IA

1. Analisa as respostas dos dois blocos junto à síntese do Módulo 1 e às propostas do Módulo 4.
2. Gera rascunho de missão: enunciado de 1–2 frases diretas, sem jargão, refletindo propósito e diferencial.
3. Gera rascunho de visão: enunciado de 1–2 frases descrevendo o estado futuro desejado em 5 anos, mensurável ou verificável.
4. Armazena as versões editadas pelo mentorado como campos `_final`.

### Output JSON

```typescript
{
  modulo: "missao_visao",
  versao_schema: "1.0",
  missao_rascunho: string,    // gerado pela IA
  visao_rascunho: string,     // gerado pela IA
  missao_final: string,       // editado e confirmado pelo mentorado
  visao_final: string         // editado e confirmado pelo mentorado
}
```

### O que Flui para o Próximo Módulo

| Campo exportado | Usado em |
|----------------|----------|
| `missao_final` | Módulo 8 |
| `visao_final` | Módulos 7, 8 |

---

## Módulo 7 — Implicações *(Beta)*

| Campo | Valor |
|-------|-------|
| **ID** | `modulo_07_implicacoes` |
| **Nome** | Implicações |
| **Fase** | Beta |
| **Objetivo** | Derivar as condições mensuráveis que precisam ser verdadeiras para cada proposta estratégica, aplicando três lentes de análise. |

### Input do Usuário

O mentorado classifica cada proposta do Módulo 4 em duas categorias:

- **Essencial** — não há caminho sem essa mudança
- **Desejável** — importante, mas pode ser postergada

A classificação é feita via interface (seleção por proposta). Não requer texto livre.

### Dados Contextuais Recebidos

| Campo | Origem |
|-------|--------|
| `propostas[*]` | Módulo 4 — Output |
| `cenarios[*]` | Módulo 3 — Cenários |
| `visao_final` | Módulo 6 — Missão e Visão |

### Processamento IA

1. Para cada proposta classificada como essencial, aplica as **3 lentes**:
   - **Clientes** — o que precisa mudar na relação, percepção ou entrega ao cliente?
   - **Empresa** — o que precisa mudar internamente (processos, estrutura, capacidades)?
   - **Competidores** — o que precisa ser verdade no cenário competitivo para que a proposta funcione?
2. Para propostas desejáveis, aplica as lentes de forma mais resumida.
3. Gera condições no formato "O que precisa ser verdade para que [proposta X] funcione: [condição mensurável]".

### Output JSON

```typescript
{
  modulo: "implicacoes",
  versao_schema: "1.0",
  condicoes: [
    {
      proposta_numero: number,         // referência ao numero da proposta do Módulo 4
      proposta_titulo: string,
      classificacao: "essencial" | "desejavel",
      lentes: {
        clientes: {
          condicao: string,            // "O que precisa ser verdade" para clientes
          indicador_sugerido: string   // métrica que evidenciaria que a condição foi atingida
        },
        empresa: {
          condicao: string,
          indicador_sugerido: string
        },
        competidores: {
          condicao: string,
          indicador_sugerido: string
        }
      }
    }
    // ... um item por proposta do Módulo 4
  ]
}
```

### O que Flui para o Próximo Módulo

| Campo exportado | Usado em |
|----------------|----------|
| `condicoes[*]` (array completo) | Módulo 8 |

---

## Módulo 8 — Plano de Futuro *(Beta)*

| Campo | Valor |
|-------|-------|
| **ID** | `modulo_08_plano_futuro` |
| **Nome** | Plano de Futuro |
| **Fase** | Beta |
| **Objetivo** | Sintetizar todo o trabalho dos módulos anteriores em um mapa estratégico operacional para o Ano 1 e um horizonte de médio prazo (Anos 2–5). |

### Input do Usuário

O mentorado realiza duas confirmações finais via interface:

1. **Confirma a visão** (exibe `visao_final` do Módulo 6 para aceite ou edição de última hora).
2. **Confirma as propostas priorizadas** (seleciona quais propostas do Módulo 4 entram no Plano de Futuro, podendo ajustar a ordem de prioridade).

### Dados Contextuais Recebidos

| Campo | Origem |
|-------|--------|
| `dimensoes[*]`, `sintese`, `top3_forcas`, `top3_alertas` | Módulo 1 — Entender |
| `problema_real`, `grande_pergunta` | Módulo 2 — Diagnosticar |
| `cenarios[*]`, `eixo_1`, `eixo_2` | Módulo 3 — Cenários |
| `propostas[*]` | Módulo 4 — Output |
| `hipoteses_causa_raiz`, `tese_investigacao_refinada` | Módulo 5 — Aprofundar |
| `missao_final`, `visao_final` | Módulo 6 — Missão e Visão |
| `condicoes[*]` | Módulo 7 — Implicações |

### Processamento IA

1. Integra todos os outputs anteriores em uma síntese coesa.
2. Gera o **Mapa Estratégico do Ano 1**: objetivos concretos, métricas de sucesso verificáveis e iniciativas práticas derivadas das propostas priorizadas e das condições das Implicações.
3. Gera o **Horizonte 2–5 anos**: descrição do que estará acontecendo em cada ano, consistente com a visão final e com os cenários mais prováveis.
4. O Ano 1 é detalhado e operacional. Os Anos 2–5 são descritivos e direcionais — não operacionais.

### Output JSON

```typescript
{
  modulo: "plano_futuro",
  versao_schema: "1.0",
  visao_confirmada: string,              // visao_final confirmada (pode ter edição de última hora)
  mapa_estrategico_ano1: {
    objetivos: [
      {
        numero: number,
        enunciado: string,               // objetivo em linguagem de resultado
        fonte: string                    // qual proposta ou condição originou este objetivo
      }
      // ... mínimo 3, máximo 6 objetivos
    ],
    metricas_sucesso: [
      {
        metrica: string,                 // indicador mensurável
        meta: string,                    // valor ou condição a atingir
        prazo: string,                   // ex: "6 meses", "Dez/2026"
        objetivo_relacionado: number     // numero do objetivo acima
      }
      // ... mínimo 3 métricas
    ],
    iniciativas: [
      {
        numero: number,
        titulo: string,
        descricao: string,
        responsavel_tipo: "liderança" | "time" | "advisor" | "externo",
        trimestre_inicio: "Q1" | "Q2" | "Q3" | "Q4",
        proposta_origem: number          // numero da proposta do Módulo 4
      }
      // ... mínimo 4 iniciativas
    ]
  },
  horizonte: [
    {
      ano: number,                       // 2, 3, 4 ou 5
      titulo: string,                    // nome do tema dominante daquele ano
      narrativa: string,                 // 2–4 frases descrevendo o que estará acontecendo
      marco_chave: string                // um evento ou resultado verificável esperado
    }
    // ... 4 itens (Anos 2, 3, 4, 5)
  ]
}
```

### O que Flui para o Próximo Módulo

Este é o módulo final. O output do Plano de Futuro é o entregável consolidado da plataforma — exportado como relatório para o mentorado e para o advisor.

---

## Notas de Implementação

### Encadeamento de Contexto

Cada módulo recebe apenas os campos necessários dos módulos anteriores — não o JSON completo. Isso reduz o tamanho do contexto enviado à IA e melhora a precisão das respostas.

Exemplo de montagem do contexto para o Módulo 4:

```json
{
  "contexto": {
    "entender": {
      "sintese": "...",
      "top3_forcas": [...],
      "top3_alertas": [...],
      "dimensoes": [...]
    },
    "diagnosticar": {
      "problema_real": "...",
      "tese_investigacao": "...",
      "grande_pergunta": "..."
    },
    "cenarios": {
      "eixo_1": {...},
      "eixo_2": {...},
      "cenarios": [...]
    },
    "cenarios_selecionados_pelo_usuario": ["A", "C"]
  }
}
```

### Validação de Schema

Todos os outputs devem ser validados contra o schema antes de serem persistidos. Campos obrigatórios ausentes devem disparar reprocessamento automático com prompt de correção.

### Versionamento

O campo `versao_schema` em cada output permite evolução futura do schema sem quebrar sessões em andamento. Sessões com schema antigo continuam funcionando com o parser correspondente.

### Tratamento de Erros

| Situação | Comportamento esperado |
|----------|----------------------|
| JSON inválido retornado pela IA | Reprocessar com instrução explícita de formato |
| Campo obrigatório ausente | Reprocessar apenas o campo faltante com contexto mínimo |
| Input do usuário muito curto (< 50 palavras) | Exibir aviso e solicitar complemento antes de processar |
| Timeout da API | Exibir estado parcial e oferecer retry |
