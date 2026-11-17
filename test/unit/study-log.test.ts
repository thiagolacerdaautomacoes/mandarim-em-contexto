import { describe, expect, it } from "vitest"

import { buildStudyLog } from "~lib/study-log"
import { type StudyCard } from "~lib/study-types"

const NOW = new Date(2026, 10, 16, 12).getTime()
const DAY = 24 * 60 * 60 * 1000

function card(overrides: Partial<StudyCard> = {}): StudyCard {
  return {
    id: "bank",
    hanzi: "银行",
    pinyin: "yínháng",
    definition: "banco",
    senses: ["banco"],
    tags: [],
    createdAt: NOW,
    lastSeenAt: NOW,
    seenCount: 1,
    dueAt: NOW,
    intervalDays: 0,
    ease: 2.3,
    repetitions: 0,
    lapses: 0,
    ...overrides
  }
}

describe("study log", () => {
  it("creates a private-by-default Markdown study snapshot", () => {
    const log = buildStudyLog(
      [
        card({
          sourceUrl: "https://private.example/path",
          sourceTitle: "Private page"
        }),
        card({
          id: "older",
          hanzi: "行",
          pinyin: "xíng",
          definition: "possível",
          createdAt: NOW - DAY,
          lastSeenAt: NOW - DAY,
          dueAt: NOW + DAY
        })
      ],
      NOW
    )

    expect(log).toContain("# Mandarim em Contexto — 2026-11-16")
    expect(log).toContain("- Cartões na coleção: 2")
    expect(log).toContain("- Pendentes neste momento: 1")
    expect(log).toContain("**银行** — yínháng: banco")
    expect(log).not.toContain("private.example")
    expect(log).not.toContain("**行**")
  })
})
