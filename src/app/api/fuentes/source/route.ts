import { NextResponse } from "next/server"

import { getFuenteDetail } from "@/lib/fuentes/data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sourceKey = searchParams.get("sourceKey")

  if (!sourceKey) {
    return NextResponse.json({ error: "Fuente inválida" }, { status: 400 })
  }

  const detail = await getFuenteDetail(sourceKey)

  if (!detail) {
    return NextResponse.json({ error: "Fuente no encontrada" }, { status: 404 })
  }

  return NextResponse.json(detail)
}
