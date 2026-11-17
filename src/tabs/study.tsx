import { useCallback, useEffect, useMemo, useState } from "react"

import { buildStudyLog } from "~lib/study-log"
import { dueCards } from "~lib/study-srs"
import { deleteStudyCard, getStudyCards, rateStudyCard } from "~lib/study-store"
import { type ReviewRating, type StudyCard } from "~lib/study-types"

import "./study.css"

type View = "review" | "cards" | "practice" | "log"

const PRACTICE_TOKENS = ["我", "今天", "在", "银行", "工作"]
const PRACTICE_ANSWER = PRACTICE_TOKENS.join("")

function Study() {
  const [cards, setCards] = useState<StudyCard[]>([])
  const [view, setView] = useState<View>("review")
  const [reveal, setReveal] = useState(false)
  const [practiceTokens, setPracticeTokens] = useState<string[]>([])
  const [practiceFeedback, setPracticeFeedback] = useState("")
  const [copyFeedback, setCopyFeedback] = useState("")

  const loadCards = useCallback(async () => {
    setCards(await getStudyCards())
  }, [])

  useEffect(() => {
    let subscribed = true
    void getStudyCards().then((loadedCards) => {
      if (subscribed) setCards(loadedCards)
    })
    return () => {
      subscribed = false
    }
  }, [])

  const due = useMemo(() => dueCards(cards), [cards])
  const studyLog = useMemo(() => buildStudyLog(cards), [cards])
  const activeCard = due[0]

  const rate = async (rating: ReviewRating) => {
    if (!activeCard) return
    await rateStudyCard(activeCard.id, rating)
    setReveal(false)
    await loadCards()
  }

  const remove = async (cardId: string) => {
    await deleteStudyCard(cardId)
    await loadCards()
  }

  const choosePracticeToken = (token: string) => {
    if (practiceTokens.includes(token)) return
    setPracticeFeedback("")
    setPracticeTokens((tokens) => [...tokens, token])
  }

  const checkPractice = () => {
    const answer = practiceTokens.join("")
    setPracticeFeedback(
      answer === PRACTICE_ANSWER
        ? "Correto. 我今天在银行工作。 O tempo vem antes do lugar e do verbo."
        : `Uma ordem natural é: 我今天在银行工作。 Sua tentativa: ${answer || "—"}`
    )
  }

  const copyStudyLog = async () => {
    try {
      await navigator.clipboard.writeText(studyLog)
      setCopyFeedback("Registro copiado. Revise-o antes de publicar no GitHub.")
    } catch {
      setCopyFeedback(
        "Não foi possível copiar automaticamente. Selecione o texto abaixo."
      )
    }
  }

  return (
    <main className="study-page">
      <header className="study-header">
        <div>
          <p className="study-eyebrow">Mandarim em contexto</p>
          <h1>Estudar</h1>
        </div>
        <p className="study-summary">
          {due.length} para revisar · {cards.length} cartões salvos
        </p>
      </header>

      <nav className="study-nav" aria-label="Áreas de estudo">
        <button
          className={view === "review" ? "active" : ""}
          onClick={() => setView("review")}>
          Revisar {due.length > 0 ? `(${due.length})` : ""}
        </button>
        <button
          className={view === "cards" ? "active" : ""}
          onClick={() => setView("cards")}>
          Cartões
        </button>
        <button
          className={view === "practice" ? "active" : ""}
          onClick={() => setView("practice")}>
          Praticar
        </button>
        <button
          className={view === "log" ? "active" : ""}
          onClick={() => setView("log")}>
          Registro
        </button>
      </nav>

      {view === "review" && (
        <section className="study-panel review-panel">
          {activeCard ? (
            <>
              <div className="review-count">Próximo da fila · {due.length}</div>
              <article className="review-card">
                <div className="card-hanzi" lang="zh">
                  {activeCard.hanzi}
                </div>
                <div className="card-pinyin">{activeCard.pinyin}</div>
                {reveal ? (
                  <div className="card-answer">
                    <strong>{activeCard.definition}</strong>
                    {activeCard.context && (
                      <p>
                        Contexto: <span lang="zh">{activeCard.context}</span>
                      </p>
                    )}
                    {activeCard.example && (
                      <p className="card-example">
                        <span lang="zh">{activeCard.example.zh}</span>
                        <br />
                        {activeCard.example.pt}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    className="reveal-button"
                    onClick={() => setReveal(true)}>
                    Mostrar significado
                  </button>
                )}
              </article>
              {reveal && (
                <div className="grade-row" aria-label="Como você se lembrou?">
                  <button onClick={() => void rate("again")}>
                    Errei<small>10 min</small>
                  </button>
                  <button onClick={() => void rate("hard")}>
                    Difícil<small>6 h</small>
                  </button>
                  <button className="good" onClick={() => void rate("good")}>
                    Bom<small>próximo intervalo</small>
                  </button>
                  <button onClick={() => void rate("easy")}>
                    Fácil<small>mais tempo</small>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <h2>Fila concluída</h2>
              <p>
                Passe o mouse sobre uma palavra anotada e use “Adicionar à
                revisão” para começar uma coleção contextual.
              </p>
            </div>
          )}
        </section>
      )}

      {view === "cards" && (
        <section className="study-panel">
          <div className="cards-heading">
            <div>
              <h2>Seus cartões</h2>
              <p>Capturados explicitamente durante a leitura.</p>
            </div>
          </div>
          {cards.length === 0 ? (
            <p className="empty-copy">Ainda não há cartões salvos.</p>
          ) : (
            <div className="cards-list">
              {[...cards]
                .sort((left, right) => right.lastSeenAt - left.lastSeenAt)
                .map((card) => (
                  <article className="saved-card" key={card.id}>
                    <div>
                      <strong className="saved-hanzi" lang="zh">
                        {card.hanzi}
                      </strong>
                      <span className="saved-pinyin">{card.pinyin}</span>
                      <p>{card.definition}</p>
                      <small>
                        {card.hsk ? `${card.hsk} · ` : ""}visto {card.seenCount}{" "}
                        vez(es)
                      </small>
                    </div>
                    <button
                      className="delete-card"
                      onClick={() => void remove(card.id)}>
                      Remover
                    </button>
                  </article>
                ))}
            </div>
          )}
        </section>
      )}

      {view === "practice" && (
        <section className="study-panel practice-panel">
          <p className="study-eyebrow">Produção guiada</p>
          <h2>Monte uma frase natural</h2>
          <p>Use as palavras para dizer: “Eu trabalho no banco hoje.”</p>
          <div className="practice-answer" aria-live="polite">
            {practiceTokens.length > 0
              ? practiceTokens.map((token) => (
                  <span key={token} lang="zh">
                    {token}
                  </span>
                ))
              : "Toque nas palavras na ordem certa"}
          </div>
          <div className="token-row" aria-label="Palavras disponíveis">
            {PRACTICE_TOKENS.map((token) => (
              <button
                disabled={practiceTokens.includes(token)}
                key={token}
                lang="zh"
                onClick={() => choosePracticeToken(token)}>
                {token}
              </button>
            ))}
          </div>
          <div className="practice-actions">
            <button className="primary" onClick={checkPractice}>
              Ver correção
            </button>
            <button
              className="secondary"
              onClick={() => {
                setPracticeTokens([])
                setPracticeFeedback("")
              }}>
              Limpar
            </button>
          </div>
          <p className="practice-feedback" aria-live="polite">
            {practiceFeedback ||
              "A correção explica a ordem e mantém sua tentativa visível."}
          </p>
        </section>
      )}

      {view === "log" && (
        <section className="study-panel log-panel">
          <p className="study-eyebrow">Registro deliberado</p>
          <h2>Resumo pronto para o GitHub</h2>
          <p>
            Este Markdown é criado localmente. Ele não inclui URL, título nem
            texto das páginas que você leu. Revise o conteúdo antes de copiá-lo
            para seu repositório de estudos.
          </p>
          <div className="log-actions">
            <button className="primary" onClick={() => void copyStudyLog()}>
              Copiar Markdown
            </button>
            {copyFeedback && <span aria-live="polite">{copyFeedback}</span>}
          </div>
          <pre className="study-log-preview">{studyLog}</pre>
        </section>
      )}
    </main>
  )
}

export default Study
