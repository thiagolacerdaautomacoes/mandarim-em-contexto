export type ReviewRating = "again" | "hard" | "good" | "easy"

export type StudyCard = {
  id: string
  hanzi: string
  pinyin: string
  definition: string
  senses: string[]
  partOfSpeech?: string
  hsk?: string
  example?: {
    zh: string
    pinyin: string
    pt: string
  }
  context?: string
  sourceUrl?: string
  sourceTitle?: string
  tags: string[]
  createdAt: number
  lastSeenAt: number
  seenCount: number
  dueAt: number
  intervalDays: number
  ease: number
  repetitions: number
  lapses: number
  lastReviewedAt?: number
}

export type StudyCardDraft = Pick<
  StudyCard,
  | "hanzi"
  | "pinyin"
  | "definition"
  | "senses"
  | "partOfSpeech"
  | "hsk"
  | "example"
  | "context"
  | "sourceUrl"
  | "sourceTitle"
  | "tags"
>

export const STUDY_ADD_CARD_MESSAGE = "mec:add-study-card"

export type AddStudyCardMessage = {
  type: typeof STUDY_ADD_CARD_MESSAGE
  draft: StudyCardDraft
}

export function isAddStudyCardMessage(
  value: unknown
): value is AddStudyCardMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as AddStudyCardMessage).type === STUDY_ADD_CARD_MESSAGE &&
    typeof (value as AddStudyCardMessage).draft?.hanzi === "string"
  )
}
