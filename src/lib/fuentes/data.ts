import "server-only"

import { unstable_cache } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import type { FuenteDetail, FuenteSummary, FuenteType } from "./types"

type StudyMaterialRow = {
  id: string
  fuente_id: string | null
  slug: string | null
  source_filename: string | null
  title_es: string | null
  year: string | null
  material_type: string | null
  language: string | null
  content_es?: string | null
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

function getFuenteType(
  materialType: string | null,
  title: string,
  sourceFilename?: string | null
): FuenteType {
  if (sourceFilename && BOOK_SOURCE_FILENAMES.has(sourceFilename)) return "libro"
  if (materialType === "book" || materialType === "libro") return "libro"
  if (/radio/i.test(title) || materialType === "radio") return "radio"
  return "conferencia"
}

function toSummary(row: StudyMaterialRow): FuenteSummary {
  const name = row.title_es || "Sin título"

  return {
    id: row.id,
    sourceKey: row.fuente_id ?? row.id,
    name,
    type: getFuenteType(row.material_type, name, row.source_filename),
    year: row.year,
    wordCount: 0,
    summary: null,
    tags: [],
  }
}

function sortSources(sources: FuenteSummary[]) {
  return sources.sort((a, b) => a.name.localeCompare(b.name, "es"))
}

async function getFuenteSummariesUncached(): Promise<FuenteSummary[]> {
  const supabase = createAdminClient()

  const [materialsRes, artifactsRes] = await Promise.all([
    supabase
      .from("study_materials")
      .select("id,fuente_id,source_filename,title_es,year,material_type,is_published")
      .eq("is_published", true),
    supabase
      .from("content_artifacts")
      .select("fuente_id,tags")
      .not("fuente_id", "is", null),
  ])

  if (materialsRes.error) throw new Error(materialsRes.error.message)

  // Build tag set per fuente_id from content_artifacts
  const tagsByFuente = new Map<string, Set<string>>()
  for (const row of artifactsRes.data ?? []) {
    const fid = (row as { fuente_id: string | null; tags: unknown }).fuente_id
    const rawTags = (row as { fuente_id: string | null; tags: unknown }).tags
    if (!fid || !Array.isArray(rawTags)) continue
    const bucket = tagsByFuente.get(fid) ?? new Set<string>()
    for (const tag of rawTags) {
      if (typeof tag === "string" && tag.length) bucket.add(tag)
    }
    tagsByFuente.set(fid, bucket)
  }

  const summaries = ((materialsRes.data ?? []) as unknown as StudyMaterialRow[]).map((row) => {
    const base = toSummary(row)
    const fid = row.fuente_id ?? row.id
    const tagSet = tagsByFuente.get(fid)
    return { ...base, tags: tagSet ? Array.from(tagSet).slice(0, 5) : [] }
  })

  return sortSources(summaries)
}

export const getFuenteSummaries = unstable_cache(
  getFuenteSummariesUncached,
  ["fuente-summaries-v6"],
  { revalidate: 3600 }
)

async function getFuenteDetailUncached(sourceKey: string): Promise<FuenteDetail | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("study_materials")
    .select("id,fuente_id,slug,source_filename,title_es,year,material_type,language,content_es,is_published")
    .eq("fuente_id", sourceKey)
    .eq("is_published", true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const row = data as unknown as StudyMaterialRow

  return {
    ...toSummary(row),
    originalTitle: null,
    sourceFilename: row.source_filename,
    fullText: row.content_es || "",
  }
}

export const getFuenteDetail = unstable_cache(
  getFuenteDetailUncached,
  ["fuente-detail-v5"],
  { revalidate: 3600 }
)
