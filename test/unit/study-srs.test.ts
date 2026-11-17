import { describe, expect, it } from "vitest"

import { dueCards, isDue, reviewCard } from "~lib/study-srs"
import { type StudyCard } from "~lib/study-types"

const NOW = Date.UTC(2026, 10, 16, 12, 0, 0)
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

describe("study scheduler", () => {
  it("returns due cards in due-date order", () => {
    const cards = [
      card({ id: "later", dueAt: NOW + DAY }),
      card({ id: "first", dueAt: NOW - 10 }),
      card({ id: "second", dueAt: NOW - 1 })
    ]

    expect(dueCards(cards, NOW).map((item) => item.id)).toEqual([
      "first",
      "second"
    ])
    expect(isDue(cards[0], NOW)).toBe(false)
  })

  it("keeps a lapse close for relearning", () => {
    const updated = reviewCard(
      card({ repetitions: 3, intervalDays: 6 }),
      "again",
      NOW
    )

    expect(updated.dueAt).toBe(NOW + 10 * 60 * 1000)
    expect(updated.lapses).toBe(1)
    expect(updated.intervalDays).toBe(0)
  })

  it("gives a new card a one-day interval after a good recall", () => {
    const updated = reviewCard(card(), "good", NOW)

    expect(updated.dueAt).toBe(NOW + DAY)
    expect(updated.repetitions).toBe(1)
    expect(updated.intervalDays).toBe(1)
  })

  it("gives an easy new card a longer first interval", () => {
    const updated = reviewCard(card(), "easy", NOW)

    expect(updated.dueAt).toBe(NOW + 3 * DAY)
    expect(updated.ease).toBeCloseTo(2.45)
  })
})
