import "server-only"

import { unstable_cache } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import type {
  ContentArtifact,
  ContentArtifactFilters,
  ContentArtifactPage,
  ContentArtifactSubtype,
} from "./types"

export const TESTIMONIO_LEVELS = {
  ley: "La Ley (Nivel Práctico)",
  autoconcepto: "El Despertar del Autoconcepto (Nivel Intermedio)",
  promesa: "La Promesa (Nivel Místico/Avanzado)",
} as const

const PAGE_SIZES = [10, 25, 50]

const CONTENT_ARTIFACT_SELECT = `
  id,
  artifact_subtype,
  title,
  subtitle,
  body,
  tags,
  source_table,
  tema_principal,
  tecnica,
  area_vida,
  nivel_dificultad,
  libros_citados,
  conferencias_citadas,
  pregunta_original,
  variantes_busqueda,
  estado_emocional,
  preguntas_relacionadas,
  resumen,
  slug,
  fuente_id
`

type ContentArtifactRow = {
  id: string
  artifact_subtype: ContentArtifactSubtype
  title: string | null
  subtitle: string | null
  body: string | null
  tags: unknown
  source_table: string | null
  tema_principal: unknown
  tecnica: unknown
  area_vida: string | null
  nivel_dificultad: string | null
  libros_citados: unknown
  conferencias_citadas: unknown
  pregunta_original: string | null
  variantes_busqueda: unknown
  estado_emocional: string | null
  preguntas_relacionadas: unknown
  resumen: string | null
  slug: string | null
  fuente_id: string | null
  similarity?: number | string | null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

function cleanPageSize(value?: number) {
  if (!value || !PAGE_SIZES.includes(value)) return 10
  return value
}

function cleanPage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) return 1
  return Math.floor(value)
}

function excerpt(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= 84) return normalized
  return `${normalized.slice(0, 84)}...`
}

export function toContentArtifact(row: ContentArtifactRow): ContentArtifact {
  const body = row.body ?? ""

  return {
    id: row.id,
    artifactSubtype: row.artifact_subtype,
    title: row.title || row.pregunta_original || "Sin título",
    subtitle: row.subtitle,
    body,
    excerpt: excerpt(body),
    tags: asStringArray(row.tags),
    sourceTable: row.source_table,
    temaPrincipal: asStringArray(row.tema_principal),
    tecnica: asStringArray(row.tecnica),
    areaVida: row.area_vida,
    nivelDificultad: row.nivel_dificultad,
    librosCitados: asStringArray(row.libros_citados),
    conferenciasCitadas: asStringArray(row.conferencias_citadas),
    preguntaOriginal: row.pregunta_original,
    variantesBusqueda: asStringArray(row.variantes_busqueda),
    estadoEmocional: row.estado_emocional,
    preguntasRelacionadas: asStringArray(row.preguntas_relacionadas),
    resumen: row.resumen,
    slug: row.slug,
    fuenteId: row.fuente_id,
    fuente_id: row.fuente_id,
    similarity:
      typeof row.similarity === "number"
        ? row.similarity
        : typeof row.similarity === "string"
          ? Number(row.similarity)
          : null,
  }
}

function applySearch<T>(queryBuilder: T, query?: string): T {
  const search = query?.trim()
  if (!search) return queryBuilder

  const safeSearch = search.replace(/%/g, "\\%").replace(/,/g, " ")
  return (queryBuilder as any).or(
    `title.ilike.%${safeSearch}%,body.ilike.%${safeSearch}%,pregunta_original.ilike.%${safeSearch}%`
  ) as T
}

async function getContentArtifactsPageUncached({
  subtype,
  page,
  pageSize,
  query,
  nivel,
}: ContentArtifactFilters): Promise<ContentArtifactPage> {
  const supabase = createAdminClient()
  const cleanSize = cleanPageSize(pageSize)
  const cleanCurrentPage = cleanPage(page)
  const from = (cleanCurrentPage - 1) * cleanSize
  const to = from + cleanSize - 1

  let request = supabase
    .from("content_artifacts")
    .select(CONTENT_ARTIFACT_SELECT, { count: "exact" })
    .eq("artifact_subtype", subtype)
    .eq("status", "published")

  if (nivel && nivel !== "all") {
    request = request.eq("nivel_dificultad", nivel)
  }

  request = applySearch(request, query)

  const { data, error, count } = await request
    .order("title", { ascending: true })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const total = count ?? 0

  return {
    rows: ((data ?? []) as unknown as ContentArtifactRow[]).map(toContentArtifact),
    total,
    page: cleanCurrentPage,
    pageSize: cleanSize,
    pageCount: Math.max(1, Math.ceil(total / cleanSize)),
  }
}

export const getContentArtifactsPage = unstable_cache(
  getContentArtifactsPageUncached,
  ["content-artifacts-page-v2"],
  { revalidate: 3600 }
)

async function getContentArtifactCountsByLevelUncached(query?: string) {
  const supabase = createAdminClient()
  const entries = await Promise.all(
    Object.values(TESTIMONIO_LEVELS).map(async (level) => {
      let request = supabase
        .from("content_artifacts")
        .select("id", { count: "exact", head: true })
        .eq("artifact_subtype", "testimonial")
        .eq("status", "published")
        .eq("nivel_dificultad", level)

      request = applySearch(request, query)

      const { count, error } = await request
      if (error) throw new Error(error.message)
      return [level, count ?? 0] as const
    })
  )

  return Object.fromEntries(entries) as Record<string, number>
}

export const getContentArtifactCountsByLevel = unstable_cache(
  getContentArtifactCountsByLevelUncached,
  ["content-artifact-counts-by-level"],
  { revalidate: 3600 }
)

async function getContentArtifactTotalUncached(
  subtype: ContentArtifactSubtype,
  query?: string
) {
  const supabase = createAdminClient()
  let request = supabase
    .from("content_artifacts")
    .select("id", { count: "exact", head: true })
    .eq("artifact_subtype", subtype)
    .eq("status", "published")

  request = applySearch(request, query)

  const { count, error } = await request
  if (error) throw new Error(error.message)
  return count ?? 0
}

export const getContentArtifactTotal = unstable_cache(
  getContentArtifactTotalUncached,
  ["content-artifact-total"],
  { revalidate: 3600 }
)

async function getContentArtifactsAllUncached(
  subtype: ContentArtifactSubtype
): Promise<ContentArtifact[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("content_artifacts")
    .select(CONTENT_ARTIFACT_SELECT)
    .eq("artifact_subtype", subtype)
    .eq("status", "published")
    .order("title", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as unknown as ContentArtifactRow[]).map(toContentArtifact)
}

export const getContentArtifactsAll = unstable_cache(
  getContentArtifactsAllUncached,
  ["content-artifacts-all-v2"],
  { revalidate: 3600 }
)

async function getContentArtifactsByIdsUncached(ids: string[]) {
  if (!ids.length) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("content_artifacts")
    .select(CONTENT_ARTIFACT_SELECT)
    .in("id", ids)

  if (error) {
    throw new Error(error.message)
  }

  const rows = ((data ?? []) as unknown as ContentArtifactRow[]).map(toContentArtifact)
  const byId = new Map(rows.map((row) => [row.id, row]))

  return ids.map((id) => byId.get(id)).filter(Boolean) as ContentArtifact[]
}

export const getContentArtifactsByIds = unstable_cache(
  getContentArtifactsByIdsUncached,
  ["content-artifacts-by-ids-v2"],
  { revalidate: 3600 }
)
