import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

const SECTION_LABEL: Record<string, string> = {
  testimonial: "Testimonios",
  explanation: "Biblia metafísica",
  respuesta_pregunta: "Preguntas y respuestas",
  cita: "Testimonios",
  explicacion: "Biblia metafísica",
}

const SECTION_URL: Record<string, string> = {
  testimonial: "/testimonios",
  explanation: "/biblia",
  respuesta_pregunta: "/preguntas",
  cita: "/testimonios",
  explicacion: "/biblia",
}

type ContentGroup = {
  title: string
  url: string
  items: Array<{ id: string; title: string; excerpt: string; url: string }>
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ groups: [] })

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json({ groups: [] })

  const safe = q.replace(/[%_]/g, "\\$&")
  const pattern = `%${safe}%`

  const admin = createAdminClient()

  const [artifactsRes, materialsRes] = await Promise.all([
    admin
      .from("content_artifacts")
      .select("id, title, body, artifact_subtype")
      .or(`title.ilike.${pattern},body.ilike.${pattern}`)
      .limit(20),
    admin
      .from("study_materials")
      .select("id, title")
      .ilike("title", pattern)
      .eq("material_type", "lecture")
      .limit(5),
  ])

  const sectionMap: Record<string, ContentGroup> = {}

  for (const row of artifactsRes.data ?? []) {
    const subtype = (row.artifact_subtype ?? "") as string
    const label = SECTION_LABEL[subtype] ?? "Contenido"
    const url = SECTION_URL[subtype] ?? "/dashboard"
    if (!sectionMap[label]) {
      sectionMap[label] = { title: label, url, items: [] }
    }
    if (sectionMap[label].items.length < 5) {
      sectionMap[label].items.push({
        id: row.id as string,
        title: (row.title ?? "") as string,
        excerpt: ((row.body ?? "") as string).slice(0, 90),
        url,
      })
    }
  }

  if ((materialsRes.data ?? []).length > 0) {
    sectionMap["Fuentes"] = {
      title: "Fuentes",
      url: "/fuentes",
      items: (materialsRes.data ?? []).map((r) => ({
        id: r.id as string,
        title: (r.title ?? "") as string,
        excerpt: "",
        url: "/fuentes",
      })),
    }
  }

  return NextResponse.json({ groups: Object.values(sectionMap) })
}
