export type FuenteType = "conferencia" | "libro" | "radio"

export type FuenteSummary = {
  id: string
  sourceKey: string
  name: string
  type: FuenteType
  year: string | null
  wordCount: number
  summary: string | null
  tags: string[]
}

export type FuenteDetail = FuenteSummary & {
  originalTitle: string | null
  sourceFilename: string | null
  fullText: string
}
