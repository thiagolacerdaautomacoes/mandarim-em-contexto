import { describe, expect, it } from "vitest"

import { lookupPortuguese } from "~lib/pt-lexicon"

describe("Portuguese contextual lookup", () => {
  it("prefers a known multi-character word over an isolated character", () => {
    const result = lookupPortuguese("我在中国银行工作", 5)

    expect(result?.hanzi).toBe("银行")
    expect(result?.definition).toContain("banco")
    expect(result?.matchedAsWord).toBe(true)
  })

  it("falls back to the individual character when no word is known", () => {
    const result = lookupPortuguese("行走", 0)

    expect(result?.hanzi).toBe("行")
    expect(result?.matchedAsWord).toBe(false)
  })

  it("returns no invented definition for an unknown character", () => {
    expect(lookupPortuguese("龘", 0)).toBeUndefined()
  })
})
