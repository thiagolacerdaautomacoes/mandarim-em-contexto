import { reviewCard } from "./study-srs"
import {
  type ReviewRating,
  type StudyCard,
  type StudyCardDraft
} from "./study-types"

const STORAGE_KEY = "mec-study-cards"

type StudyStorage = {
  get(key: string, callback: (items: Record<string, unknown>) => void): void
  set(items: Record<string, unknown>, callback?: () => void): void
}

function localStorageArea(): StudyStorage {
  return chrome.storage.local as unknown as StudyStorage
}

function readAll(storage = localStorageArea()): Promise<StudyCard[]> {
  return new Promise((resolve) => {
    storage.get(STORAGE_KEY, (items) => {
      const cards = items[STORAGE_KEY]
      resolve(Array.isArray(cards) ? (cards as StudyCard[]) : [])
    })
  })
}

function writeAll(
  cards: StudyCard[],
  storage = localStorageArea()
): Promise<void> {
  return new Promise((resolve) =>
    storage.set({ [STORAGE_KEY]: cards }, resolve)
  )
}

export async function getStudyCards(): Promise<StudyCard[]> {
  return readAll()
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `mec-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createStudyCard(
  draft: StudyCardDraft,
  now = Date.now()
): StudyCard {
  return {
    ...draft,
    id: createId(),
    tags: draft.tags ?? [],
    createdAt: now,
    lastSeenAt: now,
    seenCount: 1,
    dueAt: now,
    intervalDays: 0,
    ease: 2.3,
    repetitions: 0,
    lapses: 0
  }
}

export async function addStudyCard(draft: StudyCardDraft): Promise<StudyCard> {
  const cards = await readAll()
  const existing = cards.find(
    (card) => card.hanzi === draft.hanzi && card.definition === draft.definition
  )
  const now = Date.now()

  if (existing) {
    const updated = {
      ...existing,
      lastSeenAt: now,
      seenCount: existing.seenCount + 1,
      context: draft.context || existing.context,
      sourceUrl: draft.sourceUrl || existing.sourceUrl,
      sourceTitle: draft.sourceTitle || existing.sourceTitle
    }
    await writeAll(
      cards.map((card) => (card.id === existing.id ? updated : card))
    )
    return updated
  }

  const card = createStudyCard(draft, now)
  await writeAll([...cards, card])
  return card
}

export async function rateStudyCard(
  cardId: string,
  rating: ReviewRating
): Promise<StudyCard | undefined> {
  const cards = await readAll()
  const card = cards.find((item) => item.id === cardId)
  if (!card) return undefined

  const updated = reviewCard(card, rating)
  await writeAll(cards.map((item) => (item.id === cardId ? updated : item)))
  return updated
}

export async function deleteStudyCard(cardId: string): Promise<void> {
  const cards = await readAll()
  await writeAll(cards.filter((card) => card.id !== cardId))
}
