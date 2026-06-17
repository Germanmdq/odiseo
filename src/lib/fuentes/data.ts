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

const BOOK_FUENTE_IDS = new Set([
  'neville_goddard_at_your_command_book_',
  'feeling_is_the_secret1944_1944',
  'prayer_the_art_of_believing1945_1945',
  'five_lessons_a_master_class_',
  'out_of_this_world1949_1949',
  'seedtime_and_harvest1956_1956',
  'seedtime_and_harvest_a_mystical_view_of_the_scriptures1956_1956',
  'i_know_my_father1960_1960',
  'he_breaks_the_shell1964_rare_full_book_1964',
  'freedom_for_all1942_1942',
  'awakened_imagination1954_1954',
  'resurrection1966_1966',
])

function toSummary(row: StudyMaterialRow): FuenteSummary {
  const name = row.title_es || "Sin título"
  const fid = row.fuente_id ?? row.id

  return {
    id: row.id,
    sourceKey: fid,
    name,
    type: row.material_type === 'libro' || BOOK_FUENTE_IDS.has(fid)
      ? "libro"
      : /radio/i.test(name) ? "radio" : "conferencia",
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
  ["fuente-summaries-v11"],
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
  ["fuente-detail-v6"],
  { revalidate: 3600 }
)
