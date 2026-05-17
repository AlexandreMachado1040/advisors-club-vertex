# Arquitetura — Decisão Técnica (F1-T3)

## Decisão: Extensão do vertex_app.html existente

**Escolha:** Arquivo HTML/JS separado (`advisory_app.html`) que reutiliza o mesmo servidor proxy (`server.js`), a mesma Cloudflare Function (`analyze.js`) e o mesmo deploy no Cloudflare Pages.

**Motivo:** O VERTEX IA já está em produção e funcionando. Criar um arquivo separado evita risco de quebrar o que está operacional e permite lançar o Advisory em paralelo.

---

## Estrutura de arquivos

```
advisors-club-vertex/
├── vertex_app.html           ← VERTEX IA (6 pilares) — não tocar
├── advisory_app.html         ← NOVO — Advisory Estratégico (8 módulos)
├── logo_advisors.png
├── server.js                 ← proxy local compartilhado (adicionar suporte a moduleType)
├── functions/
│   └── api/
│       └── analyze.js        ← Cloudflare Function (adicionar temperatura por moduleType)
└── Docs/
    ├── fluxo_metodologia.md
    ├── system_prompts_mvp.md
    └── arquitetura_decisao.md
```

---

## Estrutura de dados — localStorage

Prefixo exclusivo para não colidir com o VERTEX IA:

| Chave | Conteúdo | TTL |
|-------|----------|-----|
| `advisory_session` | `{ empresa: string, segmento: string, iniciado_em: ISO }` | Até reset manual |
| `advisory_m1` | Output JSON do Módulo 1 (Entender) | Até reset manual |
| `advisory_m2` | Output JSON do Módulo 2 (Diagnosticar) | Até reset manual |
| `advisory_m3_forcas` | Array de forças mapeadas pelo usuário | Até reset manual |
| `advisory_m3` | Output JSON do Módulo 3 (Cenários) | Até reset manual |
| `advisory_m4_selecao` | Array de IDs de cenários selecionados | Até reset manual |
| `advisory_m4` | Output JSON do Módulo 4 (Output) | Até reset manual |

---

## Fluxo de dados entre módulos

```
M1 (Entender)
  └─ empresa.segmento ──────────────────────────────────► M3 input
  └─ sintese ──────────────────────────────────────────► M2 contexto
  └─ top3_alertas ─────────────────────────────────────► M2 contexto
  └─ top3_forcas, dimensoes ───────────────────────────► M4 contexto

M2 (Diagnosticar)
  └─ grande_pergunta ──────────────────────────────────► M3 contexto + M4 contexto
  └─ problema_real, tese_investigacao ─────────────────► M4 contexto

M3 (Cenários)
  └─ eixo_1, eixo_2, cenarios[] ───────────────────────► M4 contexto

M4 (Output)
  └─ propostas[] ──────────────────────────────────────► Relatório final
```

---

## Atualização necessária no analyze.js

Adicionar suporte ao parâmetro `moduleType` para ajustar temperatura:

```javascript
// functions/api/analyze.js — trecho a alterar

const { systemPrompt, userMessage, moduleType } = await request.json();

const temperaturas = {
  entender:     0.3,
  diagnosticar: 0.3,
  cenarios:     0.5,
  output:       0.5
};
const temperature = temperaturas[moduleType] ?? 0.4;

const body = JSON.stringify({
  system_instruction: { parts: [{ text: systemPrompt }] },
  contents: [{ role: 'user', parts: [{ text: userMessage }] }],
  generationConfig: {
    temperature,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json'
  }
});
```

---

## Estimativa de chamadas Gemini por sessão completa (4 módulos MVP)

| Módulo | Tokens de entrada (est.) | Tokens de saída (est.) | Total est. |
|--------|--------------------------|------------------------|------------|
| Entender | ~2.000 (9 dimensões) | ~1.500 (JSON diagnóstico) | ~3.500 |
| Diagnosticar | ~800 (respostas + contexto M1) | ~600 (JSON) | ~1.400 |
| Cenários | ~600 (forças + contexto) | ~2.000 (4 cenários detalhados) | ~2.600 |
| Output | ~3.000 (contexto completo M1+M2+M3) | ~2.500 (propostas) | ~5.500 |
| **Total por sessão** | | | **~13.000 tokens** |

Gemini 2.5 Flash Lite no plano gratuito: 1.000 RPD (requests/dia) e 250.000 TPM (tokens/min).  
Uma sessão completa = 4 chamadas. Limite prático: ~250 sessões completas por dia no tier gratuito.
