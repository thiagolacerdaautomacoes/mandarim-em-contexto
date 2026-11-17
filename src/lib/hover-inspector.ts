import { CHINESE_CLASS, PINYIN_CLASS, RESULT_CLASS, TAG_NAME } from "~constants"

import { lookupPortuguese } from "./pt-lexicon"
import { STUDY_ADD_CARD_MESSAGE } from "./study-types"

type AnnotatedContext = {
  text: string
  focusIndex: number
  focusPinyin: string
}

const CARD_ID = "mec-context-card"
const STYLE_ID = "mec-context-card-style"

function baseCharacter(wrapper: Element): string {
  return wrapper.querySelector(`.${CHINESE_CLASS}`)?.textContent?.trim() ?? ""
}

function isAnnotationWrapper(element: Element): boolean {
  return (
    element.tagName.toLowerCase() === TAG_NAME &&
    element.classList.contains(RESULT_CLASS)
  )
}

/**
 * The annotator retains wrappers as direct siblings for ordinary text nodes.
 * Using that run lets the inspector prefer a multi-character dictionary entry
 * (银行) over a misleading isolated character (行).
 */
function surroundingContext(wrapper: Element): AnnotatedContext {
  const parent = wrapper.parentElement
  const siblings = parent
    ? Array.from(parent.children).filter(isAnnotationWrapper)
    : [wrapper]
  const focus = siblings.indexOf(wrapper)
  const units = siblings.map(baseCharacter)

  return {
    text: units.join(""),
    focusIndex: Math.max(0, focus),
    focusPinyin:
      wrapper.querySelector(`.${PINYIN_CLASS}`)?.textContent?.trim() ?? ""
  }
}

function addStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
    #${CARD_ID} {
      position: fixed;
      z-index: 2147483647;
      width: min(320px, calc(100vw - 16px));
      color: #17212b;
      background: #fff;
      border: 1px solid #d8e1e5;
      border-radius: 12px;
      box-shadow: 0 14px 36px rgba(15, 32, 42, .22);
      font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 14px;
    }
    #${CARD_ID} * { box-sizing: border-box; }
    #${CARD_ID} .mec-word { font-size: 24px; font-weight: 700; }
    #${CARD_ID} .mec-pinyin { color: #087c71; margin-top: 1px; }
    #${CARD_ID} .mec-definition { margin-top: 9px; font-weight: 600; }
    #${CARD_ID} .mec-meta { color: #64748b; font-size: 12px; margin-top: 4px; }
    #${CARD_ID} .mec-example { background: #f3f7f6; border-radius: 8px; margin-top: 10px; padding: 9px; }
    #${CARD_ID} .mec-example-pt { color: #475569; font-size: 12px; margin-top: 3px; }
    #${CARD_ID} .mec-actions { align-items: center; display: flex; gap: 8px; margin-top: 12px; }
    #${CARD_ID} button { border: 0; border-radius: 7px; cursor: pointer; font: inherit; min-height: 32px; padding: 6px 10px; }
    #${CARD_ID} .mec-add { background: #087c71; color: white; font-weight: 600; }
    #${CARD_ID} .mec-close { background: transparent; color: #64748b; }
    @media (prefers-color-scheme: dark) {
      #${CARD_ID} { background: #202c33; border-color: #40515b; color: #f0f5f8; }
      #${CARD_ID} .mec-meta, #${CARD_ID} .mec-example-pt, #${CARD_ID} .mec-close { color: #b7c4cc; }
      #${CARD_ID} .mec-example { background: #293941; }
    }
  `
  document.head.appendChild(style)
}

function removeCard() {
  document.getElementById(CARD_ID)?.remove()
}

export class HoverInspector {
  private showTimer: ReturnType<typeof setTimeout> | undefined
  private closeTimer: ReturnType<typeof setTimeout> | undefined
  private activeWrapper: Element | undefined

  constructor() {
    addStyles()
    document.addEventListener("pointerover", this.onPointerOver, true)
    document.addEventListener("pointerout", this.onPointerOut, true)
    document.addEventListener("keydown", this.onKeyDown, true)
  }

  private onPointerOver = (event: PointerEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const card = target.closest(`#${CARD_ID}`)
    if (card) {
      this.cancelClose()
      return
    }

    const wrapper = target.closest(`${TAG_NAME}.${RESULT_CLASS}`)
    if (!wrapper) return
    if (wrapper === this.activeWrapper) {
      this.cancelClose()
      return
    }
    this.activeWrapper = wrapper
    this.cancelClose()
    clearTimeout(this.showTimer)
    this.showTimer = setTimeout(() => this.show(wrapper), 280)
  }

  private onPointerOut = (event: PointerEvent) => {
    const related = event.relatedTarget
    if (!(related instanceof Element)) {
      this.scheduleClose()
      return
    }
    if (related.closest(`#${CARD_ID}`)) {
      this.cancelClose()
      return
    }
    if (related.closest(`${TAG_NAME}.${RESULT_CLASS}`) === this.activeWrapper) {
      this.cancelClose()
      return
    }
    this.scheduleClose()
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.activeWrapper = undefined
      removeCard()
    }
  }

  private cancelClose() {
    clearTimeout(this.closeTimer)
  }

  private scheduleClose() {
    clearTimeout(this.showTimer)
    clearTimeout(this.closeTimer)
    this.closeTimer = setTimeout(() => {
      this.activeWrapper = undefined
      removeCard()
    }, 180)
  }

  private show(wrapper: Element) {
    if (wrapper !== this.activeWrapper || !wrapper.isConnected) return
    const context = surroundingContext(wrapper)
    const lookup = lookupPortuguese(context.text, context.focusIndex)
    if (!lookup) return

    removeCard()
    const card = document.createElement("aside")
    card.id = CARD_ID
    card.setAttribute("aria-label", `Consulta: ${lookup.hanzi}`)
    card.addEventListener("pointerenter", () => this.cancelClose())
    card.addEventListener("pointerleave", () => this.scheduleClose())

    const word = document.createElement("div")
    word.className = "mec-word"
    word.textContent = lookup.hanzi
    const pinyin = document.createElement("div")
    pinyin.className = "mec-pinyin"
    pinyin.textContent = lookup.pinyin || context.focusPinyin
    const definition = document.createElement("div")
    definition.className = "mec-definition"
    definition.textContent = lookup.definition
    card.append(word, pinyin, definition)

    const metadata = [lookup.partOfSpeech, lookup.hsk]
      .filter(Boolean)
      .join(" · ")
    if (metadata) {
      const meta = document.createElement("div")
      meta.className = "mec-meta"
      meta.textContent = metadata
      card.appendChild(meta)
    }

    if (lookup.example) {
      const example = document.createElement("div")
      example.className = "mec-example"
      const zh = document.createElement("div")
      zh.lang = "zh"
      zh.textContent = lookup.example.zh
      const reading = document.createElement("div")
      reading.className = "mec-meta"
      reading.textContent = lookup.example.pinyin
      const pt = document.createElement("div")
      pt.className = "mec-example-pt"
      pt.textContent = lookup.example.pt
      example.append(zh, reading, pt)
      card.appendChild(example)
    }

    const actions = document.createElement("div")
    actions.className = "mec-actions"
    const add = document.createElement("button")
    add.className = "mec-add"
    add.type = "button"
    add.textContent = "Adicionar à revisão"
    add.addEventListener("click", () => {
      void chrome.runtime
        .sendMessage({
          type: STUDY_ADD_CARD_MESSAGE,
          draft: {
            hanzi: lookup.hanzi,
            pinyin: lookup.pinyin,
            definition: lookup.definition,
            senses: lookup.senses,
            partOfSpeech: lookup.partOfSpeech,
            hsk: lookup.hsk,
            example: lookup.example,
            context: context.text,
            sourceUrl: location.href,
            sourceTitle: document.title,
            tags: lookup.tags ?? []
          }
        })
        .then(() => {
          add.textContent = "✓ Adicionado"
          add.disabled = true
        })
        .catch(() => {
          add.textContent = "Tente novamente"
        })
    })
    const close = document.createElement("button")
    close.className = "mec-close"
    close.type = "button"
    close.textContent = "Fechar"
    close.addEventListener("click", () => {
      this.activeWrapper = undefined
      removeCard()
    })
    actions.append(add, close)
    card.appendChild(actions)
    document.documentElement.appendChild(card)

    const rect = wrapper.getBoundingClientRect()
    const top = Math.min(
      window.innerHeight - card.offsetHeight - 8,
      rect.bottom + 8
    )
    const left = Math.min(
      window.innerWidth - card.offsetWidth - 8,
      Math.max(8, rect.left)
    )
    card.style.top = `${Math.max(8, top)}px`
    card.style.left = `${left}px`
  }
}
