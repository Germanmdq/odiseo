/**
 * Normalizes body text extracted from PDFs.
 *
 * PDFs produce hard line-breaks every ~12-15 words mixed with real paragraph
 * breaks (double newlines). This function merges single newlines within a
 * paragraph into spaces while preserving real paragraph boundaries.
 */
export function formatBodyParagraphs(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/) // real paragraph breaks = double (or blank) newlines
    .map((paragraph) =>
      paragraph
        .replace(/\s*\n\s*/g, " ") // single newlines → space
        .replace(/\s{2,}/g, " ") // collapse multiple spaces
        .trim()
    )
    .filter((p) => p.length > 0)

  return paragraphs.reduce<string[]>((acc, paragraph) => {
    const previous = acc[acc.length - 1]
    const startsLowercase = /^[a-záéíóúñü]/.test(paragraph)
    const previousLooksBroken =
      previous != null &&
      (previous.length <= 18 || !/[.!?;:)"”]$/.test(previous))

    if (previous && previousLooksBroken && startsLowercase) {
      acc[acc.length - 1] = `${previous} ${paragraph}`
      return acc
    }

    acc.push(paragraph)
    return acc
  }, [])
}
