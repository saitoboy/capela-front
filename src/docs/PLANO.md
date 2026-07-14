# Plano de Desenvolvimento — Capela Front

Frontend do [Capela API](../../../../capela/README.md). React 19 + Vite + Tailwind 4 + React Router 7.
Princípio norteador: **ultra simples**. Mobile first. Sem biblioteca de estado, sem biblioteca de formulário, sem componente que não seja usado em pelo menos duas telas.

---

## Sumário

- [Decisões](#decisões)
- [Identidade visual](#identidade-visual)
- [Regras de negócio que moldam a UI](#regras-de-negócio-que-moldam-a-ui)
- [Mapa de telas](#mapa-de-telas)
- [Rotas](#rotas)
- [Navegação](#navegação)
- [Contrato com a API](#contrato-com-a-api)
- [Mudanças no backend](#mudanças-no-backend)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Design tokens](#design-tokens)
- [Componentes base](#componentes-base)
- [Fases de entrega](#fases-de-entrega)
- [Fora de escopo](#fora-de-escopo)

---

## Decisões

Tomadas para manter o escopo enxuto. Estão aqui para serem contestadas antes de codar.

| # | Decisão | Motivo |
|---|---|---|
| 1 | **Só tema escuro** | A identidade tem dark e light, mas o dark é o hero. Suportar os dois dobra o CSS sem ganho real no v1. |
| 2 | **Sem gerenciador de estado** (Redux/Zustand/React Query) | O app tem ~6 telas e nenhum estado compartilhado além do usuário logado. `useState` + `useEffect` + um `AuthContext` bastam. |
| 3 | **Sem biblioteca de formulário** | São 2 formulários (login, cadastro). `useState` + o `required` nativo resolvem. |
| 4 | **Token JWT em `localStorage`** | Sem refresh token no backend; o token vale 7 dias. Solução mais simples que funciona. |
| 5 | **Admin em 3 telas** | Um painel (semestres) + coleta + chaves. A coleta e as chaves são operações longas e delicadas demais para caber numa seção de uma página. |
| 6 | **Polling de 3s no relatório, 2s na coleta** | O backend processa em background e não tem websocket. Polling é a única opção, e é trivial. |
| 7 | **Sinopse em acordeão, sem tela de detalhe** | A sinopse é o único conteúdo extra da capela. Não justifica navegação. |
| 8 | **Chave Groq nunca volta da API** | Só o preview mascarado (`gsk_…4f2a`). A chave vai criptografada para o banco e nunca é devolvida em texto puro, nem para o admin. |

---

## Identidade visual

Extraída de [paleta-de-cores.png](paleta-de-cores.png) e [componentes-dark-and-light.png](componentes-dark-and-light.png).

| Cor | Hex | Uso |
|---|---|---|
| Preto | `#0B0B0B` | Fundo da aplicação |
| Lima | `#C8F400` | Ações primárias, destaques, dados, estado ativo |
| Branco | `#FFFFFF` | Texto principal |

Traços da identidade a respeitar:

- Fundo preto, **cards levemente mais claros** que o fundo, com borda sutil.
- **Cantos bem arredondados** nos cards (~16px) e nos botões (~12px).
- O lima é **acento, não superfície** — usado em botões primários, números, ícone ativo e linhas de gráfico. Nunca em blocos grandes de fundo.
- Texto sobre lima é **sempre preto** (contraste AAA; texto branco sobre lima é ilegível).
- Botão primário: fundo lima, texto preto, seta `→` à direita.
- Botão outline: transparente, borda lima, texto lima.
- Botão desabilitado: cinza sobre cinza, sem lima.
- Hierarquia por peso e tamanho, não por cor. Texto secundário em cinza.

---

## Regras de negócio que moldam a UI

Levantadas lendo o backend — **não estão todas no README dele**, e cada uma elimina ou define uma tela.

1. **Persona é pré-requisito do relatório.** `POST /relatorio/gerar` devolve **422** se o aluno não tem persona (`relatorio.service.ts`). A Início precisa tratar "sem persona" como estado bloqueado, com CTA para a Persona. É o principal caminho do app.

2. **`focoCriativo` é sorteado pelo servidor**, evitando repetir o do relatório anterior. **Não é entrada do usuário** — não existe tela nem campo para escolher foco. Só é exibido como informação no relatório pronto.

3. **Um relatório por (aluno, semestre)**, e gerar de novo é um **upsert que sobrescreve** o anterior. Logo: o botão é *"Gerar relatório"* na primeira vez e *"Gerar novamente"* depois — nunca "novo relatório". Vale avisar que sobrescreve.

4. **O status inicial é `GERANDO`, não `PENDENTE`.** O README da API diz `PENDENTE`, mas o service cria com `GERANDO` e dispara o job. A UI deve fazer polling enquanto o status for `PENDENTE` **ou** `GERANDO`, para cobrir os dois casos.

5. **`GET /persona/perguntas` é público e não está documentado** no README da API. As 8 perguntas vêm da API — não devem ser duplicadas no front.

6. **`curso` só tem um valor no enum: `TEOLOGIA`.** No cadastro isso é um campo fixo exibido, não um select.

7. **O download do `.docx` é autenticado.** `GET /relatorio/:id/docx` exige o header `Authorization`, então não dá para usar um `<a href>` simples — precisa de `fetch` → `blob` → link temporário.

8. **Capela pode não ter sinopse.** `sinopse` é opcional em `CapelaPublica`. A lista precisa do estado "sinopse ainda não gerada".

8b. **`textoBiblico`, `tema` e `pregador` podem ser `NULL`.** A IA nem sempre consegue extrair da pregação. `NULL` é o sinal de **"falta preencher à mão"** — o admin assiste ao vídeo e completa com `PATCH /capela/:id`. Isso significa:
   - Na tela **Capelas** (aluno), campo `NULL` aparece como `—`, nunca como "null" nem como texto inventado.
   - Na tela **Coletar** (admin), cada linha do log traz `faltando: ["tema", "pregador"]`, e daí sai o atalho para editar.
   - **Recoletar não apaga edição manual** — o backend garante isso; a tela pode oferecer "coletar de novo" sem medo.

9. **A coleta é síncrona e demora minutos.** `coletarDoYoutube` roda, por capela: comentários do YouTube → Groq → (se incompleto) transcrição → Groq → e `gerarSinopse` → Groq. São ~3 chamadas de IA por capela; um semestre de 15 capelas passa de 40 chamadas em série. **A requisição HTTP estoura antes de terminar.** Por isso a coleta precisa virar job em background — ver [Mudanças no backend](#mudanças-no-backend).

10. **A data da capela vem do título do vídeo**, não do `publishedAt`. O filtro é um regex `DD/MM/AAAA` no título + o dia da semana. Se o título não tiver data no formato, o vídeo é ignorado silenciosamente — a tela de coleta precisa mostrar isso, senão o admin não entende por que "sumiram" capelas.

11. **`CHAPEL_KEYWORD` e `CHAPEL_WEEKDAY` são lidos do `.env` no carregamento do módulo** (`const` no topo de `youtube.service.ts`). Para o admin escolher o período e os filtros na tela, precisam virar parâmetros da chamada.

12. **A chave da Groq é uma só, fixa no `.env`.** `callGroqRaw` lê `process.env.GROQ_API_KEY` a cada chamada. Ao bater o limite de tokens, tudo quebra — coleta, sinopse e relatório — com um 429 cru. É o que a rotação de chaves resolve.

---

## Mapa de telas

10 telas. 4 do aluno, 2 de autenticação, 1 fluxo de persona (2 sub-telas), 3 de admin.

| # | Tela | Acesso | Propósito |
|---|---|---|---|
| 1 | **Login** | público | Entrar com RA + senha |
| 2 | **Cadastro** | público | Criar conta |
| 3 | **Início** | aluno | Semestre ativo, persona, estado do relatório. É o painel. |
| 4 | **Capelas** | aluno | Lista as capelas do semestre; sinopse em acordeão |
| 5 | **Persona** | aluno | Ver a persona atual; entrar no teste ou escolher direto |
| 5a | **Persona · Teste** | aluno | 8 perguntas, uma por tela |
| 5b | **Persona · Escolher** | aluno | Grade com os 16 tipos MBTI |
| 6 | **Relatórios** | aluno | Histórico por semestre + download |
| 7 | **Admin** | admin | Painel: semestres + atalhos para coleta e chaves |
| **8** | **Admin · Coletar capelas** | admin | **Buscar no YouTube: período, filtros, progresso ao vivo, log por capela** |
| **8b** | **Admin · Editar capela** | admin | **Preencher à mão o que a IA não extraiu (campos `NULL`)** |
| **9** | **Admin · Chaves Groq** | admin | **Cadastrar chaves, ver status e a rotação automática** |

Os desenhos de cada uma estão em [WIREFRAMES.md](WIREFRAMES.md).

### Estados por tela

Cada tela precisa de 4 estados. É onde a maioria dos apps simples falha.

| Tela | Carregando | Vazio | Erro | Pronto |
|---|---|---|---|---|
| Início | esqueleto dos 3 cards | — | mensagem + tentar de novo | painel |
| Capelas | esqueleto de lista | "Nenhuma capela neste semestre" | mensagem + tentar de novo | lista |
| Persona | esqueleto do card | "Você ainda não tem persona" + CTA | mensagem | card da persona |
| Relatórios | esqueleto de lista | "Nenhum relatório ainda" | mensagem | lista |
| Admin | esqueleto | "Nenhum semestre criado" | mensagem | seções |

O **card de relatório na Início** tem 5 estados próprios, e é o coração do app:

| Estado | Gatilho | O que mostra |
|---|---|---|
| Bloqueado | sem persona | "Defina sua persona para gerar seu relatório" + botão → Persona |
| Pronto para gerar | tem persona, sem relatório | Botão **Gerar relatório** |
| Gerando | status `PENDENTE` ou `GERANDO` | Spinner + "Gerando… leva cerca de 1 minuto" (polling 3s) |
| Concluído | status `CONCLUIDO` | Botão **Baixar .docx** + link "Gerar novamente" |
| Erro | status `ERRO` | `erroMsg` + botão **Tentar novamente** |

---

## Rotas

```
/login                 público
/cadastro              público

/                      aluno    → Início
/capelas               aluno    → Capelas
/persona               aluno    → Persona
/persona/teste         aluno    → Teste (8 perguntas)
/persona/escolher      aluno    → Grade MBTI
/relatorios            aluno    → Relatórios

/admin                 admin    → Admin (painel)
/admin/coletar         admin    → Coletar capelas
/admin/capelas/:id     admin    → Editar capela (preencher o que faltou)
/admin/chaves          admin    → Chaves Groq
```

Sem token → qualquer rota de aluno redireciona para `/login`.
Com token mas sem `isAdmin` → `/admin*` redireciona para `/`.

---

## Navegação

**Barra inferior fixa** (padrão mobile), 4 itens, ícones do `lucide-react`:

| Ícone | Label | Rota |
|---|---|---|
| `Home` | Início | `/` |
| `BookOpen` | Capelas | `/capelas` |
| `Sparkles` | Persona | `/persona` |
| `FileText` | Relatórios | `/relatorios` |

Item ativo em lima; os demais em cinza.

O **Admin fica fora da barra** — é uma engrenagem (`Settings`) no header, visível apenas se `isAdmin`. Assim a barra continua com 4 itens para todo mundo, e o admin não polui a navegação do aluno.

Header: saudação + semestre ativo à esquerda; engrenagem (se admin) e sair (`LogOut`) à direita.

As telas de fluxo (`/persona/teste`, `/persona/escolher`) **escondem a barra inferior** e usam um header com `←` — são fluxos de foco, não destinos.

---

## Contrato com a API

Base: `http://localhost:3003` (via `VITE_API_URL`).
Autenticação: header `Authorization: Bearer <token>`.
Erro: sempre `{ "mensagem": string }` — o cliente extrai `mensagem` e joga; a tela mostra.

Endpoints em **negrito** ainda não existem — ver [Mudanças no backend](#mudanças-no-backend).

| Tela | Chamadas |
|---|---|
| Login | `POST /auth/login` |
| Cadastro | `POST /auth/register` |
| Início | `GET /semestre/ativo` · `GET /persona/me` · `GET /relatorio/me` · `POST /relatorio/gerar` · `GET /relatorio/:id` (polling) · `GET /relatorio/:id/docx` |
| Capelas | `GET /semestre/ativo` · `GET /capela?semestreId=` |
| Persona | `GET /persona/me` |
| Persona · Teste | `GET /persona/perguntas` · `POST /persona/teste` |
| Persona · Escolher | `POST /persona/preset` |
| Relatórios | `GET /relatorio/me` · `GET /relatorio/:id/docx` |
| Admin | `GET /semestre` · `POST /semestre` · `PATCH /semestre/:id/ativar` · `GET /capela?semestreId=` |
| Admin · Coletar | `POST /capela/coletar` (agora **202 + jobId**) · **`GET /capela/coletar/:id`** (polling 2s) |
| Admin · Editar capela | `GET /capela/:id` · **`PATCH /capela/:id`** · `POST /sinopse/:capelaId` |
| Admin · Chaves | **`GET /groq-key`** · **`POST /groq-key`** · **`DELETE /groq-key/:id`** · **`PATCH /groq-key/:id/reativar`** |

A grade dos 16 tipos MBTI (sigla + nome) **é do front** — o backend só aceita a sigla em `POST /persona/preset` e devolve o nome. Os nomes ("O Protagonista", "O Arquiteto"…) estão em `persona.service.ts` e serão espelhados numa constante local só para a grade.

---

## Mudanças no backend

> ✅ **Já implementadas e verificadas em [`D:\capela`](../../../../capela)** — 14/07/2026. Detalhes e exemplos de payload no [README da API](../../../../capela/README.md). Esta seção fica como registro do porquê de cada uma.

### A · Coleta como job em background

**Problema.** `coletarDoYoutube` é síncrona e faz ~3 chamadas de IA por capela, em série. Um semestre inteiro passa de 40 chamadas. A requisição HTTP não sobrevive a isso, e o admin não tem nenhum sinal de progresso.

**Solução.** Mesmo padrão que o relatório já usa: cria o registro, responde na hora, processa em `setImmediate`, o front faz polling.

Nova tabela:

```prisma
model Coleta {
  id          String   @id @default(uuid())
  semestreId  String   @map("semestre_id")
  status      String   @default("GERANDO") @db.VarChar(20)  // GERANDO | CONCLUIDO | ERRO
  etapa       String?  @db.VarChar(120)   // "Buscando vídeos no canal…"
  total       Int      @default(0)        // capelas identificadas
  processadas Int      @default(0)        // já concluídas
  inseridas   Int      @default(0)
  atualizadas Int      @default(0)
  itens       Json?                       // log por capela: { indice, tema, source, erro? }
  erroMsg     String?  @map("erro_msg")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  semestre Semestre @relation(fields: [semestreId], references: [id], onDelete: Cascade)

  @@map("coletas")
}
```

Mudanças nos endpoints:

| Endpoint | Antes | Depois |
|---|---|---|
| `POST /capela/coletar` | Bloqueia por minutos, devolve `{inseridas, atualizadas, erros}` | Responde **202** na hora com o registro da coleta (`id`, `status: GERANDO`) |
| **`GET /capela/coletar/:id`** | — | Progresso: `status`, `etapa`, `total`, `processadas`, `inseridas`, `atualizadas`, `itens[]` |

O corpo do `POST` ganha campos opcionais — é o que permite ao admin escolher período e filtros na tela. Todos caem no default atual quando omitidos:

```jsonc
{
  "semestreId": "uuid",              // obrigatório
  "publishedAfter":  "2026-02-01",   // opcional — default: datas do semestre
  "publishedBefore": "2026-07-01",   // opcional
  "canal":    "@souseminariodosul",  // opcional — default: CHANNEL_HANDLE
  "keyword":  "Devoção na Capela",   // opcional — default: CHAPEL_KEYWORD
  "weekday":  2,                     // opcional — default: CHAPEL_WEEKDAY
  "gerarSinopses": true              // opcional — default: true
}
```

Em `youtube.service.ts`, `CHAPEL_KEYWORD` e `CHAPEL_WEEKDAY` deixam de ser `const` de módulo e passam a ser parâmetros de `collectChapels(opts)`. A função ganha um callback `onProgress(etapa, processadas, total)` que o service grava na tabela a cada capela — é isso que alimenta o polling.

**Vídeos descartados também entram no log.** Hoje, um vídeo sem data `DD/MM/AAAA` no título, ou fora do dia da semana, é ignorado em silêncio. A tela precisa mostrar "3 vídeos ignorados (sem data no título)", senão o admin não entende por que faltaram capelas.

### B · Rotação de chaves da Groq

**Problema.** `callGroqRaw` lê `process.env.GROQ_API_KEY`. Ao bater o limite de tokens, **tudo** quebra — coleta, sinopse e relatório — com um 429 cru para o usuário.

**Solução.** Uma fila de chaves no banco. A cada chamada, usa a primeira chave ativa; se a Groq responder 429 (limite) ou 401 (chave inválida), marca a chave e **repete a chamada com a próxima**, de forma transparente. Ninguém vê o erro.

Nova tabela:

```prisma
model GroqKey {
  id         String    @id @default(uuid())
  label      String    @db.VarChar(60)    // apelido: "chave do Guilherme"
  keyEnc     String    @map("key_enc")    // AES-256-GCM — nunca sai do banco em texto puro
  preview    String    @db.VarChar(20)    // "gsk_…4f2a" — é só isso que a API devolve
  status     String    @default("ATIVA") @db.VarChar(12)  // ATIVA | ESGOTADA | INVALIDA
  resetAt    DateTime? @map("reset_at")   // quando a Groq disse que o limite volta
  lastUsedAt DateTime? @map("last_used_at")
  erroMsg    String?   @map("erro_msg")
  criadoPor  String    @map("criado_por") @db.VarChar(20) // ra de quem cadastrou
  createdAt  DateTime  @default(now()) @map("created_at")

  @@map("groq_keys")
}
```

Novo `utils/groqKeys.ts`:

| Função | O que faz |
|---|---|
| `getChaveAtiva()` | Primeira `ATIVA`, ordenada por `lastUsedAt` (round-robin natural) |
| `marcarEsgotada(id, resetAt)` | Status `ESGOTADA` + quando volta, lido do header `retry-after` do 429 |
| `marcarInvalida(id, msg)` | Status `INVALIDA` no 401/403 — chave errada não volta sozinha |
| `reativarExpiradas()` | Chamada antes de cada busca: `ESGOTADA` com `resetAt` no passado volta a ser `ATIVA` |

`callGroqRaw` vira um laço sobre as chaves disponíveis:

```
para cada chave ativa:
  tenta a chamada
  200 → atualiza lastUsedAt, devolve
  429 → marcarEsgotada(chave, retry-after); tenta a próxima
  401 → marcarInvalida(chave);             tenta a próxima
  outro erro → propaga (não é problema de chave)
acabaram as chaves → erro 503 "Todas as chaves da Groq estão esgotadas. Cadastre uma nova."
```

**Retrocompatibilidade:** se não houver nenhuma chave no banco, cai no `process.env.GROQ_API_KEY` de hoje. Nada quebra enquanto o admin não cadastrar a primeira.

Novos endpoints:

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/groq-key` | ✅ | Lista as chaves — **só o preview mascarado**, nunca a chave |
| `POST` | `/groq-key` | ✅ | Cadastra `{ label, key }`. Valida contra a Groq antes de salvar |
| `DELETE` | `/groq-key/:id` | 🔒 | Remove |
| `PATCH` | `/groq-key/:id/reativar` | 🔒 | Força uma `ESGOTADA`/`INVALIDA` de volta para `ATIVA` |

**Segurança — três pontos que valem atenção:**

1. **A chave é criptografada em repouso** (AES-256-GCM, com um `APP_ENCRYPTION_KEY` novo no `.env`) e **nunca é devolvida pela API**, nem para o admin. `GET /groq-key` só entrega `gsk_…4f2a`. Chave que vaza em resposta de API vai parar em log, cache e histórico do navegador.
2. **Validar a chave antes de salvar.** Uma chamada barata na Groq no `POST`. Chave inválida cadastrada só é descoberta quando quebra a geração de alguém.
3. **Qualquer aluno pode cadastrar; só o admin remove.** É o que você pediu ("cada usuário coloca uma chave nova"), mas repare no que isso significa: **a chave doada entra num pool e vai gastar tokens servindo requisição dos outros alunos**. Precisa estar escrito na tela, e está — ver o wireframe. Se preferir restringir o cadastro só ao admin, é trocar um middleware.

---

## Estrutura de pastas

```
src/
├── main.tsx
├── App.tsx                    # rotas
├── index.css                  # @theme com os tokens
├── api/
│   └── client.ts              # fetch + token + tratamento de erro
├── auth/
│   ├── AuthContext.tsx        # usuario, token, login, logout
│   └── ProtectedRoute.tsx     # guarda de rota (aluno / admin)
├── components/
│   ├── Button.tsx             # primary | outline | ghost
│   ├── Card.tsx
│   ├── Input.tsx              # label + campo + erro
│   ├── StatusPill.tsx         # status do relatório
│   ├── Spinner.tsx
│   ├── EmptyState.tsx
│   └── BottomNav.tsx
├── layouts/
│   └── AppShell.tsx           # header + <Outlet/> + BottomNav
├── lib/
│   ├── mbti.ts                # os 16 tipos + nomes (grade)
│   ├── format.ts              # datas em pt-BR
│   └── download.ts            # blob autenticado → .docx
└── pages/
    ├── Login.tsx
    ├── Cadastro.tsx
    ├── Inicio.tsx
    ├── Capelas.tsx
    ├── Persona.tsx
    ├── PersonaTeste.tsx
    ├── PersonaEscolher.tsx
    ├── Relatorios.tsx
    ├── Admin.tsx
    ├── AdminColetar.tsx
    └── AdminChaves.tsx
```

`src/App.css`, `src/assets/react.svg` e `src/assets/vite.svg` são do scaffold e serão removidos.

---

## Design tokens

Tailwind 4 configura tema no CSS, sem `tailwind.config.js`. Em `index.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg:      #0B0B0B;   /* fundo */
  --color-surface: #141414;   /* cards */
  --color-line:    #262626;   /* bordas */
  --color-lime:    #C8F400;   /* acento */
  --color-muted:   #A1A1A1;   /* texto secundário */

  --radius-card: 1rem;
  --radius-btn:  0.75rem;
}
```

Uso: `bg-bg`, `bg-surface`, `border-line`, `text-lime`, `text-muted`, `rounded-card`.

Escala tipográfica (só 4 tamanhos):

| Papel | Classe |
|---|---|
| Número/destaque | `text-3xl font-semibold` |
| Título de tela | `text-xl font-semibold` |
| Corpo | `text-base` |
| Rótulo/secundário | `text-sm text-muted` |

---

## Componentes base

Sete. Nada além disso sem uma segunda tela pedindo.

| Componente | Variações |
|---|---|
| `Button` | `primary` (lima/preto) · `outline` (borda lima) · `ghost` (texto) — todos com `disabled` e `loading` |
| `Card` | superfície + borda + raio; `onClick` opcional o torna clicável |
| `Input` | rótulo, campo, mensagem de erro, `type=password` com olho |
| `StatusPill` | `PENDENTE`/`GERANDO` (cinza, pulsando) · `CONCLUIDO` (lima) · `ERRO` (vermelho) |
| `Spinner` | um tamanho |
| `EmptyState` | ícone + frase + CTA opcional |
| `BottomNav` | 4 itens, ativo em lima |

---

## Fases de entrega

Cada fase é executável e verificável de ponta a ponta.

| Fase | Entrega | Pronto quando |
|---|---|---|
| **0 — Base** | tokens no `index.css`, `api/client.ts`, `AuthContext`, `ProtectedRoute`, `AppShell`, `BottomNav`, componentes base, rotas | O app sobe, redireciona para `/login` e a navegação funciona com telas vazias |
| **1 — Autenticação** | Login, Cadastro | Dá para criar conta, entrar, recarregar sem perder a sessão e sair |
| **2 — Persona** | Persona, Teste, Escolher | O aluno define a persona pelos dois caminhos e ela aparece na Início |
| **3 — Início** | Painel com os 5 estados do card de relatório | O aluno gera o relatório, vê o polling e baixa o `.docx` |
| **4 — Capelas** | Lista + sinopse em acordeão | As capelas do semestre ativo aparecem com sinopse |
| **5 — Relatórios** | Histórico + download | Relatórios de semestres anteriores baixam |
| **6 — Admin** | Painel de semestres | O admin cria semestre e ativa |
| **7 — Chaves Groq** | Tela de chaves | O admin cadastra, vê o status e reativa |
| **8 — Coletar capelas** | Tela de coleta | O admin escolhe período e filtros, acompanha o progresso e vê o log por capela |
| **8b — Editar capela** | Formulário de edição | O admin preenche o que ficou `NULL` e gera a sinopse |

O backend das fases 7, 8 e 8b **já está pronto** — as telas só precisam consumir.

A **Persona vem antes da Início** de propósito: a Início depende da persona para sair do estado bloqueado, então testá-la primeiro dá o caminho completo.

---

## Fora de escopo

Deliberadamente de fora, para o app continuar simples:

- Tema claro (a identidade tem, mas fica para depois).
- Recuperação de senha — o backend não tem endpoint.
- Edição de perfil — o backend não tem endpoint.
- Inserção manual de capela (`POST /capela/manual`) e exclusão (`DELETE /capela/:id`) — existem na API, mas coleta do YouTube cobre o caso real. Entram se pedirem.
- Paginação — um semestre tem ~15 capelas.
- Testes automatizados, PWA, i18n, animações.
