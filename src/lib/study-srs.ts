import { type ReviewRating, type StudyCard } from "./study-types"

const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE

export function isDue(card: StudyCard, now = Date.now()): boolean {
  return card.dueAt <= now
}

export function dueCards(cards: StudyCard[], now = Date.now()): StudyCard[] {
  return cards
    .filter((card) => isDue(card, now))
    .sort((left, right) => left.dueAt - right.dueAt)
}

/**
 * A compact, transparent scheduler for the first release. It intentionally
 * favours quick relearning after an error and conservative first intervals.
 */
export function reviewCard(
  card: StudyCard,
  rating: ReviewRating,
  now = Date.now()
): StudyCard {
  const fresh = card.repetitions === 0
  const currentInterval = Math.max(card.intervalDays, 1)

  if (rating === "again") {
    return {
      ...card,
      dueAt: now + 10 * MINUTE,
      intervalDays: 0,
      ease: Math.max(1.3, card.ease - 0.2),
      lapses: card.lapses + 1,
      lastReviewedAt: now
    }
  }

  const multiplier =
    rating === "hard" ? 1.2 : rating === "easy" ? card.ease * 1.3 : card.ease
  const firstInterval = rating === "hard" ? 0.25 : rating === "easy" ? 3 : 1
  const intervalDays = fresh
    ? firstInterval
    : Math.max(1, Math.round(currentInterval * multiplier))
  const easeChange = rating === "easy" ? 0.15 : rating === "hard" ? -0.15 : 0

  return {
    ...card,
    dueAt: now + intervalDays * DAY,
    intervalDays,
    ease: Math.max(1.3, card.ease + easeChange),
    repetitions: card.repetitions + 1,
    lastReviewedAt: now
  }
}

export const timeUntilDue = (card: StudyCard, now = Date.now()) =>
  Math.max(0, card.dueAt - now)
