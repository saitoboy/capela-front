import type { MbtiTipo } from '../api/types';

/**
 * Espelho de PERSONA_MAP (backend — persona.service.ts). Serve só para desenhar a
 * grade de escolha: a API só aceita a sigla e devolve o nome e o tom.
 * A ordem é a da grade do wireframe (2 colunas × 8 linhas).
 */
export const MBTI: { tipo: MbtiTipo; nome: string; tom: string }[] = [
  { tipo: 'INTJ', nome: 'O Arquiteto',    tom: 'estratégico e direto'    },
  { tipo: 'INTP', nome: 'O Lógico',       tom: 'analítico e curioso'     },
  { tipo: 'ENTJ', nome: 'O Comandante',   tom: 'assertivo e visionário'  },
  { tipo: 'ENTP', nome: 'O Inovador',     tom: 'debatedor e criativo'    },
  { tipo: 'INFJ', nome: 'O Advogado',     tom: 'empático e idealista'    },
  { tipo: 'INFP', nome: 'O Mediador',     tom: 'reflexivo e poético'     },
  { tipo: 'ENFJ', nome: 'O Protagonista', tom: 'inspirador e acolhedor'  },
  { tipo: 'ENFP', nome: 'O Ativista',     tom: 'entusiasta e expressivo' },
  { tipo: 'ISTJ', nome: 'O Inspetor',     tom: 'metódico e confiável'    },
  { tipo: 'ISFJ', nome: 'O Defensor',     tom: 'cuidadoso e leal'        },
  { tipo: 'ESTJ', nome: 'O Executivo',    tom: 'organizado e pragmático' },
  { tipo: 'ESFJ', nome: 'O Cônsul',       tom: 'prestativo e sociável'   },
  { tipo: 'ISTP', nome: 'O Virtuoso',     tom: 'prático e observador'    },
  { tipo: 'ISFP', nome: 'O Aventureiro',  tom: 'gentil e espontâneo'     },
  { tipo: 'ESTP', nome: 'O Empreendedor', tom: 'energético e ousado'     },
  { tipo: 'ESFP', nome: 'O Animador',     tom: 'divertido e espontâneo'  },
];
