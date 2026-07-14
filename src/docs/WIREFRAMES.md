# Wireframes — Capela Front

Desenhos mobile first, pensados numa tela de **360px**. Acompanham o [PLANO.md](PLANO.md).

Legenda:

```
[ Texto → ]   botão primário — fundo lima, texto preto
( Texto )     botão outline — borda lima, texto lima
· Texto ·     link / botão fantasma
▓▓▓░░░        barra de progresso (lima sobre cinza)
●             indicador de status
▸ / ▾         acordeão fechado / aberto
« lima »      o que aparece em lima (#C8F400)
```

Regra de layout que vale para todas: fundo `#0B0B0B`, conteúdo com 16px de respiro nas laterais, cards de canto arredondado sobre `#141414`, barra inferior fixa de 64px.

---

## 1 · Login

```
┌───────────────────────────────┐
│                               │
│                               │
│          ◆ Capela             │  « ◆ lima »
│    Relatórios de capela       │  cinza
│                               │
│  RA                           │  cinza, 14px
│  ┌─────────────────────────┐  │
│  │ 251000841               │  │
│  └─────────────────────────┘  │
│                               │
│  Senha                        │
│  ┌─────────────────────────┐  │
│  │ ••••••••••           👁 │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │       Entrar         →  │  │  « lima, texto preto »
│  └─────────────────────────┘  │
│                               │
│                               │
│   Não tem conta? · Criar ·    │  « Criar em lima »
│                               │
└───────────────────────────────┘
```

Erro da API entra como uma faixa vermelha discreta acima do botão. Sem barra inferior.

---

## 2 · Cadastro

```
┌───────────────────────────────┐
│  ←                            │
│                               │
│  Criar conta                  │  20px, semibold
│                               │
│  Nome                         │
│  ┌─────────────────────────┐  │
│  │ Débora Silva            │  │
│  └─────────────────────────┘  │
│  RA                           │
│  ┌─────────────────────────┐  │
│  │ 251000841               │  │
│  └─────────────────────────┘  │
│  E-mail                       │
│  ┌─────────────────────────┐  │
│  │ debora@email.com        │  │
│  └─────────────────────────┘  │
│  Senha                        │
│  ┌─────────────────────────┐  │
│  │ ••••••••             👁 │  │
│  └─────────────────────────┘  │
│  Confirmar senha              │
│  ┌─────────────────────────┐  │
│  │ ••••••••             👁 │  │
│  └─────────────────────────┘  │
│  Curso                        │
│  ┌─────────────────────────┐  │
│  │ TEOLOGIA           🔒   │  │  fixo — o enum só tem esse
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │    Criar conta       →  │  │
│  └─────────────────────────┘  │
│                               │
│   Já tem conta? · Entrar ·    │
└───────────────────────────────┘
```

`confirmSenha` é validado no cliente antes de enviar — evita ida e volta na rede.

---

## 3 · Início

O painel. Três cards empilhados. É a tela que o aluno mais vê.

### 3a — sem persona (estado bloqueado)

```
┌───────────────────────────────┐
│  Olá, Débora            ⚙  ⏻  │  ⚙ só se admin
│  1º Semestre 2026             │  cinza — semestre ativo
│                               │
│  ┌─────────────────────────┐  │
│  │  SUA PERSONA            │  │  cinza, 12px, tracking
│  │                         │  │
│  │       ?                 │  │  cinza, grande
│  │  Nenhuma definida       │  │
│  │                         │  │
│  │  ┌───────────────────┐  │  │
│  │  │  Definir persona →│  │  │  « lima »
│  │  └───────────────────┘  │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  RELATÓRIO         🔒   │  │
│  │                         │  │
│  │  Defina sua persona     │  │  cinza
│  │  para gerar o relatório │  │
│  │                         │  │
│  │  ┌───────────────────┐  │  │
│  │  │  Gerar relatório  │  │  │  desabilitado — cinza
│  │  └───────────────────┘  │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  CAPELAS                │  │
│  │  12                     │  │  « lima », 32px
│  │  neste semestre      →  │  │
│  └─────────────────────────┘  │
│                               │
├───────────────────────────────┤
│   ⌂       ▤       ✦       ▣   │  « ⌂ ativo em lima »
│ Início Capelas Persona Relat. │
└───────────────────────────────┘
```

### 3b — pronto para gerar

```
│  ┌─────────────────────────┐  │
│  │  SUA PERSONA            │  │
│  │  ENFJ                   │  │  « lima », 32px
│  │  O Protagonista         │  │  branco, semibold
│  │  inspirador e acolhedor │  │  cinza
│  │                Trocar → │  │  · link lima ·
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  RELATÓRIO              │  │
│  │  1º Semestre 2026       │  │
│  │  12 capelas · ENFJ      │  │  cinza
│  │                         │  │
│  │  ┌───────────────────┐  │  │
│  │  │ Gerar relatório → │  │  │  « lima »
│  │  └───────────────────┘  │  │
│  └─────────────────────────┘  │
```

### 3c — gerando (polling de 3s)

```
│  ┌─────────────────────────┐  │
│  │  RELATÓRIO              │  │
│  │  ◐ Gerando…             │  │  pill cinza pulsando
│  │                         │  │
│  │  Leva cerca de 1 minuto.│  │  cinza
│  │  Pode sair desta tela.  │  │
│  │                         │  │
│  │  ▓▓▓▓▓▓░░░░░░░░░░░░░░   │  │  barra indeterminada « lima »
│  └─────────────────────────┘  │
```

O aviso "pode sair desta tela" é importante: o job roda no servidor e sobrevive à navegação.

### 3d — concluído

```
│  ┌─────────────────────────┐  │
│  │  RELATÓRIO              │  │
│  │  ● Concluído            │  │  « pill lima »
│  │  ENFJ · foco pastoral   │  │  cinza
│  │                         │  │
│  │  ┌───────────────────┐  │  │
│  │  │  Baixar .docx   ↓ │  │  │  « lima »
│  │  └───────────────────┘  │  │
│  │                         │  │
│  │   · Gerar novamente ·   │  │  ghost — avisa que sobrescreve
│  └─────────────────────────┘  │
```

O `foco pastoral` é só leitura — sorteado pelo servidor, o aluno não escolhe.

### 3e — erro

```
│  ┌─────────────────────────┐  │
│  │  RELATÓRIO              │  │
│  │  ● Erro                 │  │  pill vermelho
│  │                         │  │
│  │  Falha ao gerar a       │  │  erroMsg da API
│  │  reflexão teológica.    │  │
│  │                         │  │
│  │  ┌───────────────────┐  │  │
│  │  │ Tentar novamente  │  │  │  ( outline )
│  │  └───────────────────┘  │  │
│  └─────────────────────────┘  │
```

---

## 4 · Capelas

Lista simples; a sinopse abre em acordeão no próprio card, sem tela de detalhe.

```
┌───────────────────────────────┐
│  Capelas                      │  20px semibold
│  1º Semestre 2026 · 12        │  cinza
│                               │
│  ┌─────────────────────────┐  │
│  │  01 · 04 mar            │  │  « 01 lima » · data cinza
│  │  A fé que sustenta      │  │  branco, semibold
│  │  Hebreus 11:1           │  │  cinza
│  │  Pr. João Silva         │  │  cinza
│  │  ─────────────────────  │  │
│  │  Sinopse             ▸  │  │  « lima »
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  02 · 11 mar            │  │
│  │  Servir com alegria     │  │
│  │  Filipenses 2:3         │  │
│  │  Pra. Ana Costa         │  │
│  │  ─────────────────────  │  │
│  │  Sinopse             ▾  │  │  ← aberto
│  │                         │  │
│  │  A pregação percorre    │  │  corpo, 14px
│  │  a exortação paulina    │  │
│  │  à humildade, ligando   │  │
│  │  o serviço ao exemplo   │  │
│  │  de Cristo…             │  │
│  │                         │  │
│  │  · Assistir no YouTube ↗│  │  só se tiver url
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  03 · 18 mar            │  │
│  │  —                      │  │  tema NULL → travessão, nunca "null"
│  │  Oseias 2:14            │  │
│  │  —                      │  │  pregador NULL
│  │  ─────────────────────  │  │
│  │  Sinopse ainda não      │  │  cinza, sem seta
│  │  gerada                 │  │
│  └─────────────────────────┘  │
│                               │
├───────────────────────────────┤
│   ⌂       ▤       ✦       ▣   │  « ▤ ativo »
└───────────────────────────────┘
```

Vazio: `EmptyState` com "Nenhuma capela neste semestre ainda."

**Campo `NULL` vira `—`.** `textoBiblico`, `tema` e `pregador` podem vir nulos quando a IA não conseguiu extrair. Para o aluno isso é só um traço discreto; quem preenche é o admin, em [8b](#8b--admin--editar-capela). O que nunca pode aparecer é a palavra "null" — nem um "(não encontrado)" que finge ser dado.

---

## 5 · Persona

```
┌───────────────────────────────┐
│  Persona                      │
│                               │
│  ┌─────────────────────────┐  │
│  │                         │  │
│  │         ENFJ            │  │  « lima », 48px, centralizado
│  │                         │  │
│  │    O Protagonista       │  │  branco, 20px
│  │  inspirador e acolhedor │  │  cinza
│  │                         │  │
│  └─────────────────────────┘  │
│                               │
│  Sua persona define o tom     │  cinza, 14px
│  com que a IA escreve o seu   │
│  relatório.                   │
│                               │
│  ┌─────────────────────────┐  │
│  │   Refazer o teste    →  │  │  « lima »
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │   Escolher outro tipo   │  │  ( outline )
│  └─────────────────────────┘  │
│                               │
├───────────────────────────────┤
│   ⌂       ▤       ✦       ▣   │  « ✦ ativo »
└───────────────────────────────┘
```

Sem persona: o card vira um `?` grande em cinza com "Você ainda não tem persona", e os botões viram **Fazer o teste** / **Escolher meu tipo**.

---

## 5a · Persona · Teste

Uma pergunta por tela, 8 no total. Sem barra inferior — é fluxo de foco. Tocar na opção **seleciona e avança**, sem botão "próximo".

```
┌───────────────────────────────┐
│  ←                     3 / 8  │  cinza
│  ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░   │  « lima »
│                               │
│                               │
│  Na hora da pregação, o       │  20px, semibold
│  que mais prende sua          │
│  atenção?                     │
│                               │
│  ┌─────────────────────────┐  │
│  │  A                      │  │  « A em lima »
│  │  Exemplos práticos e    │  │
│  │  aplicações diretas     │  │
│  │  para o dia a dia       │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  B                      │  │
│  │  As conexões teológicas │  │
│  │  e ideias mais amplas   │  │
│  │  por trás da mensagem   │  │
│  └─────────────────────────┘  │
│                               │
│                               │
│         · Voltar ·            │
└───────────────────────────────┘
```

Tocar no card: a borda acende em lima por ~150ms e a tela avança. Na 8ª resposta, envia `POST /persona/teste` com as 8 respostas de uma vez e mostra o resultado.

### Resultado

```
┌───────────────────────────────┐
│                               │
│                               │
│          ✦                    │  « lima »
│                               │
│    Sua persona é              │  cinza
│                               │
│         ENFJ                  │  « lima », 48px
│    O Protagonista             │  branco, 20px
│  inspirador e acolhedor       │  cinza
│                               │
│  É esse o tom que a IA vai    │  cinza, 14px
│  usar no seu relatório.       │
│                               │
│  ┌─────────────────────────┐  │
│  │      Concluir        →  │  │  « lima » → volta pra /persona
│  └─────────────────────────┘  │
│                               │
│    · Escolher outro tipo ·    │
│                               │
└───────────────────────────────┘
```

---

## 5b · Persona · Escolher

Grade de 2 colunas × 8 linhas. Tocar salva (`POST /persona/preset`) e volta.

```
┌───────────────────────────────┐
│  ←                            │
│  Escolher tipo                │  20px semibold
│  Toque no seu tipo MBTI.      │  cinza
│                               │
│  ┌───────────┐ ┌───────────┐  │
│  │ INTJ      │ │ INTP      │  │  « sigla lima », 18px
│  │ O Arquit. │ │ O Lógico  │  │  cinza, 12px
│  └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐  │
│  │ ENTJ      │ │ ENTP      │  │
│  │ O Coman.  │ │ O Inovad. │  │
│  └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐  │
│  │ INFJ      │ │ INFP      │  │
│  │ O Advog.  │ │ O Mediad. │  │
│  └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐  │
│  │ ENFJ    ● │ │ ENFP      │  │  ● atual — borda lima
│  │ O Protag. │ │ O Ativis. │  │
│  └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐  │
│  │ ISTJ      │ │ ISFJ      │  │
│  └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐  │
│  │ ESTJ      │ │ ESFJ      │  │
│  └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐  │
│  │ ISTP      │ │ ISFP      │  │
│  └───────────┘ └───────────┘  │
│  ┌───────────┐ ┌───────────┐  │
│  │ ESTP      │ │ ESFP      │  │
│  └───────────┘ └───────────┘  │
│                               │
│    Não sabe seu tipo?         │
│    · Fazer o teste ·          │
└───────────────────────────────┘
```

---

## 6 · Relatórios

Um relatório por semestre. A lista é curta por natureza.

```
┌───────────────────────────────┐
│  Relatórios                   │
│                               │
│  ┌─────────────────────────┐  │
│  │  1º Semestre 2026       │  │  branco, semibold
│  │  ● Concluído            │  │  « pill lima »
│  │  ENFJ · foco pastoral   │  │  cinza
│  │                         │  │
│  │  ┌───────────────────┐  │  │
│  │  │  Baixar .docx   ↓ │  │  │  « lima »
│  │  └───────────────────┘  │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  2º Semestre 2025       │  │
│  │  ● Concluído            │  │
│  │  INTJ · foco teológico  │  │
│  │                         │  │
│  │  ┌───────────────────┐  │  │
│  │  │  Baixar .docx   ↓ │  │  │
│  │  └───────────────────┘  │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  1º Semestre 2025       │  │
│  │  ● Erro                 │  │  pill vermelho
│  │  Falha na geração       │  │
│  └─────────────────────────┘  │
│                               │
├───────────────────────────────┤
│   ⌂       ▤       ✦       ▣   │  « ▣ ativo »
└───────────────────────────────┘
```

Vazio: "Nenhum relatório ainda." + botão **Gerar o do semestre atual** → leva pra Início.

---

## 7 · Admin · Painel

Semestres + os dois atalhos. Só aparece para `isAdmin`.

```
┌───────────────────────────────┐
│  ←  Admin                     │
│                               │
│  SEMESTRES                    │  cinza, 12px, tracking
│  ┌─────────────────────────┐  │
│  │ 1º Semestre 2026        │  │
│  │ fev – jul · 12 capelas  │  │  cinza
│  │                 ● ATIVO │  │  « pill lima »
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ 2º Semestre 2025        │  │
│  │ ago – dez · 14 capelas  │  │
│  │              ( Ativar ) │  │  ( outline )
│  └─────────────────────────┘  │
│                               │
│  · + Novo semestre ·          │  « lima » — abre o formulário
│                               │
│  ┌─────────────────────────┐  │
│  │ Rótulo                  │  │  ← aparece ao tocar em "+ Novo"
│  │ ┌─────────────────────┐ │  │
│  │ │ 2º Semestre 2026    │ │  │
│  │ └─────────────────────┘ │  │
│  │ Início        Fim       │  │
│  │ ┌────────┐  ┌────────┐  │  │
│  │ │01/08/26│  │20/12/26│  │  │
│  │ └────────┘  └────────┘  │  │
│  │ ┌─────────────────────┐ │  │
│  │ │      Criar       →  │ │  │  « lima »
│  │ └─────────────────────┘ │  │
│  └─────────────────────────┘  │
│                               │
│  ─────────────────────────    │
│                               │
│  ┌─────────────────────────┐  │
│  │  ▶ Coletar capelas      │  │  card clicável → /admin/coletar
│  │  12 capelas · 9 sinopses│  │  cinza
│  │                      →  │  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │  ⚿ Chaves da Groq       │  │  card clicável → /admin/chaves
│  │  2 ativas · 1 esgotada  │  │  cinza
│  │                      →  │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘
```

Sem barra inferior — chega pela engrenagem do header e sai pelo `←`.

---

## 8 · Admin · Coletar capelas

A tela que busca os vídeos no YouTube e monta o semestre. É o trabalho mais pesado do sistema inteiro — **cerca de 3 chamadas de IA por capela** — então a tela é feita para *acompanhar*, não só disparar.

### 8a — configurar

Tudo já vem preenchido: as datas do semestre, os filtros do `.env`. O admin só ajusta o que quiser.

```
┌───────────────────────────────┐
│  ←  Coletar capelas           │
│                               │
│  Semestre                     │  cinza
│  ┌─────────────────────────┐  │
│  │ 1º Semestre 2026     ▾  │  │  select
│  └─────────────────────────┘  │
│                               │
│  PERÍODO DE BUSCA             │  cinza, 12px, tracking
│  De                  Até      │
│  ┌────────────┐ ┌───────────┐ │
│  │ 01/02/2026 │ │01/07/2026 │ │  vem do semestre — editável
│  └────────────┘ └───────────┘ │
│                               │
│  FILTROS                      │
│  Canal                        │
│  ┌─────────────────────────┐  │
│  │ @souseminariodosul      │  │
│  └─────────────────────────┘  │
│  Palavra-chave no título      │
│  ┌─────────────────────────┐  │
│  │ Devoção na Capela       │  │
│  └─────────────────────────┘  │
│  Dia da semana                │
│  ┌─────────────────────────┐  │
│  │ Terça-feira          ▾  │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ ☑ Gerar sinopses junto  │  │  checkbox — ligado
│  └─────────────────────────┘  │
│                               │
│  ⚠ Vai usar cerca de 3        │  cinza — aviso honesto
│    chamadas de IA por capela. │
│    Chaves ativas: 2           │  « 2 em lima »
│                               │
│  ┌─────────────────────────┐  │
│  │   Buscar capelas     →  │  │  « lima »
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

O aviso do custo com o número de chaves ativas é de propósito: liga esta tela à de chaves, no momento em que a informação importa.

### 8b — coletando (polling de 2s)

O admin pode sair. O job roda no servidor.

```
┌───────────────────────────────┐
│  ←  Coletar capelas           │
│                               │
│  ┌─────────────────────────┐  │
│  │  ◐ Coletando            │  │  pill pulsando
│  │                         │  │
│  │  5 de 12                │  │  « lima », 30px
│  │  capelas processadas    │  │  cinza
│  │                         │  │
│  │  ▓▓▓▓▓▓▓▓░░░░░░░░░░░    │  │  « lima » — 5/12
│  │                         │  │
│  │  Extraindo dados de     │  │  cinza — campo `etapa`
│  │  "Servir com alegria"…  │  │
│  │                         │  │
│  │  Pode sair desta tela.  │  │  cinza
│  └─────────────────────────┘  │
│                               │
│  LOG                          │  cinza, 12px, tracking
│  ┌─────────────────────────┐  │
│  │ ✓ 01 A fé que sustenta  │  │  « ✓ lima »
│  │      comentários        │  │  cinza, 11px — origem
│  ├─────────────────────────┤  │
│  │ ✓ 02 Servir com alegria │  │
│  │      comentários+transc.│  │
│  ├─────────────────────────┤  │
│  │ ⚠ 03 O chamado ao       │  │  ⚠ amarelo — parcial
│  │      deserto            │  │
│  │      pregador não achado│  │
│  ├─────────────────────────┤  │
│  │ ✓ 04 Graça e verdade    │  │
│  │      comentários        │  │
│  ├─────────────────────────┤  │
│  │ ◐ 05 …                  │  │  em andamento
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

O log é o coração da tela. Cada linha mostra **de onde o dado veio** (`comentarios`, `comentarios+transcricao`, `parcial`, `incompleto`) — é o campo `_source` que o backend já calcula e hoje joga fora. É como o admin sabe em quais capelas confiar.

### 8c — concluído

```
┌───────────────────────────────┐
│  ←  Coletar capelas           │
│                               │
│  ┌─────────────────────────┐  │
│  │  ● Concluído            │  │  « pill lima »
│  │                         │  │
│  │   9        3        0   │  │  « lima », 28px
│  │ inseridas atualiz. erros│  │  cinza
│  │                         │  │
│  │  ⚠ 3 vídeos ignorados   │  │  cinza — importante!
│  │    (sem data no título) │  │
│  └─────────────────────────┘  │
│                               │
│  ⚠ 4 capelas com campos em    │  card âmbar — o gancho para editar
│    branco. A IA não achou     │
│    tudo; preencha à mão.      │
│                               │
│  ┌─────────────────────────┐  │
│  │   Ver as capelas     →  │  │  « lima »
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │   Coletar de novo       │  │  ( outline ) — não apaga edição manual
│  └─────────────────────────┘  │
│                               │
│  LOG                          │
│  ┌─────────────────────────┐  │
│  │ ✓ 01 A fé que sustenta  │  │
│  │      comentários        │  │
│  ├─────────────────────────┤  │
│  │ ⚠ 03 (sem tema)         │  │  « ⚠ âmbar »
│  │      falta: tema,       │  │  âmbar — vem de `itens[].faltando`
│  │      pregador           │  │
│  │           ( Preencher ) │  │  → /admin/capelas/:id
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

Duas linhas fazem esta tela valer:

- **"3 vídeos ignorados (sem data no título)"** — o backend descartava esses vídeos em silêncio. Com isso na tela, o admin vai lá e arruma o título no YouTube.
- **"falta: tema, pregador"** — vem do campo `faltando` que o backend agora devolve por capela. É o que transforma o log em lista de tarefas, com o botão **Preencher** ao lado.

"Coletar de novo" é seguro: o backend **nunca sobrescreve com `NULL`** um campo já preenchido à mão.

---

## 8b · Admin · Editar capela

Onde o admin preenche o que a IA não achou. Chega pelo botão **Preencher** do log, ou tocando numa capela na lista.

O vídeo fica no topo, porque o trabalho é literalmente: assistir e transcrever.

```
┌───────────────────────────────┐
│  ←  Capela 03                 │
│  18 mar 2026                  │  cinza
│                               │
│  ┌─────────────────────────┐  │
│  │  ▶ Assistir no YouTube  │  │  ( outline ) — abre em nova aba
│  └─────────────────────────┘  │
│                               │
│  Tema                         │
│  ┌─────────────────────────┐  │
│  │ Em branco               │  │  placeholder cinza + borda âmbar
│  └─────────────────────────┘  │  « borda âmbar = falta preencher »
│                               │
│  Texto bíblico                │
│  ┌─────────────────────────┐  │
│  │ Oseias 2:14             │  │  borda normal — a IA achou
│  └─────────────────────────┘  │
│                               │
│  Pregador                     │
│  ┌─────────────────────────┐  │
│  │ Em branco               │  │  borda âmbar
│  └─────────────────────────┘  │
│                               │
│  Data                         │
│  ┌─────────────────────────┐  │
│  │ 18/03/2026              │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │      Salvar          →  │  │  « lima »
│  └─────────────────────────┘  │
│                               │
│  ─────────────────────────    │
│                               │
│  SINOPSE                      │
│  ┌─────────────────────────┐  │
│  │ Ainda não gerada.       │  │  cinza
│  │                         │  │
│  │ ┌─────────────────────┐ │  │
│  │ │  Gerar sinopse   →  │ │  │  « lima »
│  │ └─────────────────────┘ │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

Detalhes que importam:

- **Campo vazio tem borda âmbar**, não vermelha. Não é erro — é tarefa pendente. A cor diz "falta você", sem alarmar.
- O placeholder é **"Em branco"**, nunca "(não encontrado)". O backend agora grava `NULL` de verdade; o front não deve reintroduzir o texto falso que a gente acabou de matar.
- **Gerar sinopse fica desabilitado** enquanto a capela não tiver tema **nem** texto bíblico — o backend recusa com `422`, porque sem nada disso a IA inventaria a pregação inteira. Com um dos dois preenchido, o botão libera.

### 8d — erro (chaves esgotadas no meio)

```
│  ┌─────────────────────────┐  │
│  │  ● Erro                 │  │  pill vermelho
│  │                         │  │
│  │  Parou em 7 de 12.      │  │
│  │                         │  │
│  │  Todas as chaves da     │  │  erroMsg
│  │  Groq estão esgotadas.  │  │
│  │                         │  │
│  │  ┌───────────────────┐  │  │
│  │  │ Cadastrar chave → │  │  │  « lima » → /admin/chaves
│  │  └───────────────────┘  │  │
│  │  ┌───────────────────┐  │  │
│  │  │ Continuar coleta  │  │  │  ( outline ) — retoma de onde parou
│  │  └───────────────────┘  │  │
│  └─────────────────────────┘  │
```

As 7 capelas já processadas ficam salvas. "Continuar" roda de novo — o upsert por `videoId` garante que as prontas não são refeitas.

---

## 9 · Admin · Chaves da Groq

A fila de chaves. Quando a de cima estoura, o backend passa para a próxima sozinho — esta tela só mostra isso acontecendo.

```
┌───────────────────────────────┐
│  ←  Chaves da Groq            │
│                               │
│  Quando uma chave bate o      │  cinza, 14px
│  limite de tokens, o app usa  │
│  a próxima da fila sozinho.   │
│                               │
│  ┌─────────────────────────┐  │
│  │ ● EM USO                │  │  « pill lima »
│  │ chave do Guilherme      │  │  branco, semibold
│  │ gsk_…4f2a               │  │  mono, cinza
│  │ usada há 2 min          │  │  cinza, 11px
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ ○ NA FILA               │  │  pill cinza
│  │ chave da Débora         │  │
│  │ gsk_…9c1b               │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ ◐ ESGOTADA              │  │  pill âmbar
│  │ chave do seminário      │  │
│  │ gsk_…77de               │  │
│  │ volta às 14:30          │  │  « lima » — do `retry-after`
│  │            ( Reativar ) │  │  ( outline )
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ ✕ INVÁLIDA              │  │  pill vermelho
│  │ chave antiga            │  │
│  │ gsk_…0a3f               │  │
│  │ recusada pela Groq      │  │  cinza
│  │            ( Remover )  │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  + Adicionar chave   →  │  │  « lima »
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

Quatro estados, quatro formas. `ESGOTADA` mostra **quando volta** — vem do header `retry-after` do 429 da Groq, não de um chute.

### 9a — adicionar chave

```
┌───────────────────────────────┐
│  ←  Adicionar chave           │
│                               │
│  Apelido                      │  cinza
│  ┌─────────────────────────┐  │
│  │ chave do Guilherme      │  │
│  └─────────────────────────┘  │
│                               │
│  Chave da API                 │
│  ┌─────────────────────────┐  │
│  │ gsk_••••••••••••••••••  │  │  type=password
│  └─────────────────────────┘  │
│  Pegue em console.groq.com    │  cinza, 11px
│                               │
│  ┌─────────────────────────┐  │
│  │ ⚠ A sua chave entra     │  │  card de aviso, borda âmbar
│  │   numa fila compartilha-│  │
│  │   da e vai gastar tokens│  │
│  │   gerando relatório de  │  │
│  │   outros alunos também. │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  Validar e salvar    →  │  │  « lima »
│  └─────────────────────────┘  │
│                               │
│  A chave é criptografada e    │  cinza, 11px
│  nunca mais é exibida.        │
└───────────────────────────────┘
```

Dois avisos que **não são enfeite**:

- **"vai gastar tokens dos outros"** — é a consequência real de um pool compartilhado, e quem doa a chave precisa saber antes, não depois.
- **"Validar e salvar"**, não só "Salvar" — o `POST` faz uma chamada barata na Groq antes de gravar. Chave errada tem que falhar aqui, não no meio da coleta de outra pessoa.

Depois de salva, a chave **nunca mais aparece** — nem para o admin. Só o `gsk_…4f2a`.

---

## Desktop

Não há tela de desktop desenhada de propósito. A regra é: **o conteúdo trava em `max-w-md` (448px) e centraliza**. O app continua a mesma coluna mobile, com o preto ocupando as laterais. É o mais simples que funciona, e a barra inferior continua fazendo sentido.

Se um dia precisar de desktop de verdade, a barra inferior vira uma lateral — como no `componentes-dark-and-light.png`. Não agora.
