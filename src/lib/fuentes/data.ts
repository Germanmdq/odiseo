import "server-only"

import { unstable_cache } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import type { FuenteDetail, FuenteSummary, FuenteType } from "./types"

type StudyMaterialRow = {
  id: string
  slug: string | null
  source_filename: string | null
  title_es: string | null
  title_en: string | null
  original_title: string | null
  year: string | null
  material_type: string | null
  language: string | null
  summary_es: string | null
  summary_en: string | null
  content_es?: string | null
  content_en?: string | null
  topics?: unknown
  tags?: unknown
  is_published: boolean | null
}

const BOOK_SOURCE_FILENAMES = new Set([
  "599-a-tus-ordenes.md",
  "600-tu-fe-es-tu-fortuna.md",
  "601-libertad-para-todos.md",
  "602-la-sensacion-es-el-secreto.md",
  "603-la-oracion-el-arte-de-creer.md",
  "604-la-busqueda.md",
  "605-cinco-lecciones.md",
  "606-fuera-de-este-mundo.md",
  "607-el-poder-de-la-conciencia.md",
  "608-la-imaginacion-despierta.md",
  "609-tiempo-de-siembra-y-cosecha.md",
  "610-yo-conozco-a-mi-padre.md",
  "611-la-ley-y-la-promesa.md",
  "612-el-rompe-el-cascaron.md",
  "613-resurreccion.md",
])

function asStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === "string" && v.length > 0)
}

function getFuenteType(
  materialType: string | null,
  title: string,
  sourceFilename?: string | null
): FuenteType {
  if (sourceFilename && BOOK_SOURCE_FILENAMES.has(sourceFilename)) return "libro"
  if (materialType === "book") return "libro"
  if (/radio/i.test(title) || materialType === "radio") return "radio"
  return "conferencia"
}

function toSummary(row: StudyMaterialRow): FuenteSummary {
  const name = row.title_es || row.title_en || row.original_title || "Sin título"

  return {
    id: row.id,
    sourceKey: row.id,
    name,
    type: getFuenteType(row.material_type, name, row.source_filename),
    year: row.year,
    wordCount: 0,
    summary: row.summary_es || row.summary_en,
    tags: [],
  }
}

function sortSources(sources: FuenteSummary[]) {
  return sources.sort((a, b) => a.name.localeCompare(b.name, "es"))
}

async function getFuenteSummariesUncached(): Promise<FuenteSummary[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("study_materials")
    .select(
      "id,source_filename,title_es,title_en,original_title,year,material_type,summary_es,summary_en,topics,tags,is_published"
    )
    .eq("is_published", true)

  if (error) {
    throw new Error(error.message)
  }

  const summaries = ((data ?? []) as unknown as StudyMaterialRow[]).map((row) => ({
    ...toSummary(row),
    tags: [...asStrings(row.topics), ...asStrings(row.tags)].slice(0, 4),
  }))

  return sortSources(summaries)
}

export const getFuenteSummaries = unstable_cache(
  getFuenteSummariesUncached,
  ["fuente-summaries-v3"],
  { revalidate: 3600 }
)

async function getFuenteDetailUncached(sourceKey: string): Promise<FuenteDetail | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("study_materials")
    .select(
      "id,slug,source_filename,title_es,title_en,original_title,year,material_type,language,summary_es,summary_en,content_es,content_en,topics,tags,is_published"
    )
    .eq("id", sourceKey)
    .eq("is_published", true)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) return null

  const row = data as unknown as StudyMaterialRow

  return {
    ...toSummary(row),
    tags: [...asStrings(row.topics), ...asStrings(row.tags)].slice(0, 4),
    originalTitle: row.original_title,
    sourceFilename: row.source_filename,
    fullText: row.content_es || row.content_en || "",
  }
}

export const getFuenteDetail = unstable_cache(
  getFuenteDetailUncached,
  ["fuente-detail-v3"],
  { revalidate: 3600 }
)
