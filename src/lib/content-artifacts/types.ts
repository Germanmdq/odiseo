export type ContentArtifactSubtype =
  | "testimonial"
  | "explanation"
  | "respuesta_pregunta"

export type ContentArtifact = {
  id: string
  artifactSubtype: ContentArtifactSubtype
  title: string
  subtitle: string | null
  body: string
  excerpt: string
  tags: string[]
  sourceTable: string | null
  temaPrincipal: string[]
  tecnica: string[]
  areaVida: string | null
  nivelDificultad: string | null
  librosCitados: string[]
  conferenciasCitadas: string[]
  preguntaOriginal: string | null
  variantesBusqueda: string[]
  estadoEmocional: string | null
  preguntasRelacionadas: string[]
  resumen: string | null
  slug: string | null
  similarity?: number | null
}

export type ContentArtifactPage = {
  rows: ContentArtifact[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export type ContentArtifactFilters = {
  subtype: ContentArtifactSubtype
  page?: number
  pageSize?: number
  query?: string
  nivel?: string
}
