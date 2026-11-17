import { dueCards } from "./study-srs"
import { type StudyCard } from "./study-types"

function dayStart(now: number): number {
  const date = new Date(now)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function isoDate(now: number): string {
  const date = new Date(now)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function oneLine(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/\|/g, "\\|")
    .trim()
}

/**
 * Produces a reviewable Markdown snapshot. It intentionally omits source URLs
 * and page text so a study log can be committed without exposing browsing data.
 */
export function buildStudyLog(cards: StudyCard[], now = Date.now()): string {
  const start = dayStart(now)
  const newToday = cards.filter((card) => card.createdAt >= start)
  const reviewedToday = cards.filter(
    (card) => (card.lastReviewedAt ?? 0) >= start
  )
  const touchedToday = cards
    .filter(
      (card) =>
        card.createdAt >= start ||
        card.lastSeenAt >= start ||
        (card.lastReviewedAt ?? 0) >= start
    )
    .sort((left, right) => right.lastSeenAt - left.lastSeenAt)
    .slice(0, 20)

  const vocabulary = touchedToday.length
    ? touchedToday
        .map(
          (card) =>
            `- **${oneLine(card.hanzi)}** — ${oneLine(card.pinyin)}: ${oneLine(card.definition)}`
        )
        .join("\n")
    : "- Nenhuma palavra foi capturada ou revisada hoje."

  return [
    `# Mandarim em Contexto — ${isoDate(now)}`,
    "",
    "## Resumo",
    `- Cartões na coleção: ${cards.length}`,
    `- Pendentes neste momento: ${dueCards(cards, now).length}`,
    `- Novos hoje: ${newToday.length}`,
    `- Revisados hoje: ${reviewedToday.length}`,
    "",
    "## Vocabulário tocado hoje",
    vocabulary,
    "",
    "## Próximo passo",
    "- Revisar os cartões pendentes e escrever uma frase curta com uma das palavras acima.",
    "",
    "_Gerado localmente pelo Mandarim em Contexto. Revise antes de publicar._"
  ].join("\n")
}
