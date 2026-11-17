import { pinyin } from "pinyin-pro"

export type PortugueseEntry = {
  hanzi: string
  definition: string
  senses: string[]
  partOfSpeech?: string
  hsk?: string
  example?: { zh: string; pinyin: string; pt: string }
  tags?: string[]
}

export type ContextLookup = PortugueseEntry & {
  pinyin: string
  matchedAsWord: boolean
}

/**
 * Seed vocabulary for a first personal build. It is intentionally inspectable
 * and easy to extend; a licensed full dictionary belongs in a separate import
 * pipeline rather than in the page content script.
 */
export const PORTUGUESE_LEXICON: PortugueseEntry[] = [
  {
    hanzi: "你好",
    definition: "olá; oi",
    senses: ["saudação informal"],
    partOfSpeech: "expressão",
    hsk: "HSK 1",
    example: { zh: "你好！", pinyin: "Nǐ hǎo!", pt: "Olá!" },
    tags: ["cumprimentos"]
  },
  {
    hanzi: "中国",
    definition: "China",
    senses: ["República Popular da China; país"],
    partOfSpeech: "nome próprio",
    hsk: "HSK 1",
    example: {
      zh: "我在中国工作。",
      pinyin: "Wǒ zài Zhōngguó gōngzuò.",
      pt: "Eu trabalho na China."
    },
    tags: ["lugares"]
  },
  {
    hanzi: "银行",
    definition: "banco; instituição financeira",
    senses: ["banco", "agência bancária"],
    partOfSpeech: "substantivo",
    hsk: "HSK 2",
    example: {
      zh: "我在银行工作。",
      pinyin: "Wǒ zài yínháng gōngzuò.",
      pt: "Eu trabalho em um banco."
    },
    tags: ["trabalho", "HSK 2"]
  },
  {
    hanzi: "工作",
    definition: "trabalhar; trabalho",
    senses: ["trabalhar", "emprego; trabalho"],
    partOfSpeech: "verbo / substantivo",
    hsk: "HSK 1",
    example: {
      zh: "今天我工作。",
      pinyin: "Jīntiān wǒ gōngzuò.",
      pt: "Hoje eu trabalho."
    },
    tags: ["trabalho"]
  },
  {
    hanzi: "今天",
    definition: "hoje",
    senses: ["no dia de hoje"],
    partOfSpeech: "tempo",
    hsk: "HSK 1",
    example: {
      zh: "今天很忙。",
      pinyin: "Jīntiān hěn máng.",
      pt: "Hoje está muito corrido."
    },
    tags: ["tempo"]
  },
  {
    hanzi: "喜欢",
    definition: "gostar de",
    senses: ["apreciar", "ter preferência por"],
    partOfSpeech: "verbo",
    hsk: "HSK 1",
    example: {
      zh: "我喜欢中文。",
      pinyin: "Wǒ xǐhuan Zhōngwén.",
      pt: "Eu gosto de chinês."
    },
    tags: ["preferências"]
  },
  {
    hanzi: "中文",
    definition: "língua chinesa; chinês",
    senses: ["idioma chinês", "texto em chinês"],
    partOfSpeech: "substantivo",
    hsk: "HSK 1",
    example: {
      zh: "她学习中文。",
      pinyin: "Tā xuéxí Zhōngwén.",
      pt: "Ela estuda chinês."
    },
    tags: ["idioma"]
  },
  {
    hanzi: "学习",
    definition: "estudar; aprender",
    senses: ["aprender", "estudar"],
    partOfSpeech: "verbo",
    hsk: "HSK 1",
    example: {
      zh: "我学习中文。",
      pinyin: "Wǒ xuéxí Zhōngwén.",
      pt: "Eu estudo chinês."
    },
    tags: ["estudo"]
  },
  {
    hanzi: "谢谢",
    definition: "obrigado(a)",
    senses: ["agradecimento"],
    partOfSpeech: "expressão",
    hsk: "HSK 1",
    example: { zh: "谢谢你。", pinyin: "Xièxie nǐ.", pt: "Obrigado(a)." },
    tags: ["cumprimentos"]
  },
  {
    hanzi: "茶",
    definition: "chá",
    senses: ["bebida feita com folhas de chá"],
    partOfSpeech: "substantivo",
    hsk: "HSK 1",
    example: {
      zh: "请给我一杯茶。",
      pinyin: "Qǐng gěi wǒ yì bēi chá.",
      pt: "Por favor, me dê uma xícara de chá."
    },
    tags: ["comida e bebida"]
  },
  {
    hanzi: "我",
    definition: "eu; me",
    senses: ["primeira pessoa do singular"],
    partOfSpeech: "pronome",
    hsk: "HSK 1",
    tags: ["pronomes"]
  },
  {
    hanzi: "在",
    definition: "estar em; em; no/na",
    senses: ["indica localização", "estar fazendo algo"],
    partOfSpeech: "preposição / verbo",
    hsk: "HSK 1",
    tags: ["gramática"]
  },
  {
    hanzi: "行",
    definition: "andar; linha; capaz",
    senses: ["andar", "linha; profissão", "ser possível"],
    partOfSpeech: "caractere polissêmico",
    tags: ["caracteres"]
  },
  {
    hanzi: "银",
    definition: "prata; dinheiro",
    senses: ["metal prata", "relativo a dinheiro"],
    partOfSpeech: "substantivo",
    tags: ["caracteres"]
  }
]

const SORTED_ENTRIES = [...PORTUGUESE_LEXICON].sort(
  (left, right) => right.hanzi.length - left.hanzi.length
)

function reading(word: string): string {
  return pinyin(word, { toneType: "symbol" })
}

/** Finds the longest known word that covers the focused character. */
export function lookupPortuguese(
  surroundingText: string,
  focusIndex: number
): ContextLookup | undefined {
  for (const entry of SORTED_ENTRIES) {
    let index = surroundingText.indexOf(entry.hanzi)
    while (index !== -1) {
      if (focusIndex >= index && focusIndex < index + entry.hanzi.length) {
        return {
          ...entry,
          pinyin: reading(entry.hanzi),
          matchedAsWord: entry.hanzi.length > 1
        }
      }
      index = surroundingText.indexOf(entry.hanzi, index + 1)
    }
  }

  const char = [...surroundingText][focusIndex]
  if (!char) return undefined
  const entry = PORTUGUESE_LEXICON.find((candidate) => candidate.hanzi === char)
  return entry
    ? { ...entry, pinyin: reading(char), matchedAsWord: false }
    : undefined
}
