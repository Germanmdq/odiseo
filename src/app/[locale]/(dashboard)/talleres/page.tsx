import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { checkAccess } from "@/lib/acceso"
import { LeccionesBloqueables } from "./components/lecciones-bloqueables"

const TALLERES_VIMEO: Record<string, string> = {
  "ley-de-la-asuncion": "VIMEO_ID_AQUI",
  "vivir-desde-el-final": "VIMEO_ID_AQUI",
  "reescribir-autoconcepto": "VIMEO_ID_AQUI",
  "despertar-imaginacion": "VIMEO_ID_AQUI",
}

const TALLERES_VIDEO_SRC: Record<string, string> = {
  "ley-de-la-asuncion": "/videos/talleres/video-2.mp4",
  "vivir-desde-el-final": "/videos/talleres/video-3.mp4",
  "reescribir-autoconcepto": "/videos/talleres/video-1.mp4",
  "despertar-imaginacion": "/videos/talleres/video-4.mp4",
}

const talleres = [
  {
    key: "ley-de-la-asuncion",
    number: 1,
    titleKey: "taller1Title",
    descKey: "taller1Desc",
    lessons: [
      "t1l1",
      "t1l2",
      "t1l3",
      "t1l4",
      "t1l5",
      "t1l6",
      "t1l7",
      "t1l8",
    ],
  },
  {
    key: "vivir-desde-el-final",
    number: 2,
    titleKey: "taller2Title",
    descKey: "taller2Desc",
    lessons: [
      "t2l1",
      "t2l2",
      "t2l3",
      "t2l4",
      "t2l5",
      "t2l6",
      "t2l7",
      "t2l8",
    ],
  },
  {
    key: "reescribir-autoconcepto",
    number: 3,
    titleKey: "taller3Title",
    descKey: "taller3Desc",
    lessons: [
      "t3l1",
      "t3l2",
      "t3l3",
      "t3l4",
      "t3l5",
      "t3l6",
      "t3l7",
      "t3l8",
    ],
  },
  {
    key: "despertar-imaginacion",
    number: 4,
    titleKey: "taller4Title",
    descKey: "taller4Desc",
    lessons: [
      "t4l1",
      "t4l2",
      "t4l3",
      "t4l4",
      "t4l5",
      "t4l6",
      "t4l7",
      "t4l8",
    ],
  },
] as const

function VimeoPreview({
  title,
  localSrc,
  vimeoId,
}: {
  title: string
  localSrc: string
  vimeoId: string
}) {
  const isPlaceholder = vimeoId.includes("VIMEO_ID")

  return (
    <div className="bg-muted relative aspect-video overflow-hidden rounded-md border">
      {isPlaceholder ? (
        <video
          src={localSrc}
          className="h-full w-full object-cover"
          controls
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  )
}

export default async function TalleresPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const landing = await getTranslations({ locale, namespace: "landing.talleres" })
  const t = await getTranslations({ locale, namespace: "talleres" })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let hasActiveSubscription = false
  if (user) {
    const acceso = await checkAccess(user.id)
    hasActiveSubscription = acceso.allowed && acceso.plan === "anual"
  }

  return (
    <div className="flex-1 space-y-6 px-4 pt-0 md:px-6">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit">
          {landing("eyebrow")}
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight">{landing("title")}</h1>
        <p className="text-muted-foreground max-w-3xl">{landing("subtitle")}</p>
      </div>

      {!hasActiveSubscription && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold">Los Talleres están incluidos en el plan anual</p>
            <p className="text-sm text-muted-foreground">
              Suscribite al plan anual ($47 USD) para desbloquear todos los talleres en video.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href={`/${locale}/pricing`}>Ver planes</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {talleres.map((taller) => (
          <Card key={taller.key} className="overflow-hidden rounded-2xl border-black/10 py-0 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
            <CardHeader className="gap-4 p-4 pb-0 sm:p-6 sm:pb-0">
              <div className="flex items-start justify-between gap-4">
                <span className="text-primary/20 text-5xl font-black leading-none tabular-nums sm:text-7xl">
                  {String(taller.number).padStart(2, "0")}
                </span>
                <Badge variant="secondary">{landing("lessons")}</Badge>
              </div>

              <VimeoPreview
                title={landing(taller.titleKey)}
                localSrc={TALLERES_VIDEO_SRC[taller.key]}
                vimeoId={TALLERES_VIMEO[taller.key]}
              />
            </CardHeader>

            <CardContent className="space-y-5 p-4 sm:p-6">
              <div>
                <h2 className="text-xl font-semibold">{landing(taller.titleKey)}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {landing(taller.descKey)}
                </p>
              </div>

              <details className="group rounded-2xl border border-black/10 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
                  <span>{landing("lessons")}</span>
                  <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t p-3">
                  <LeccionesBloqueables
                    lessons={taller.lessons.map((lessonKey) => ({
                      label: t(`leccion.${lessonKey}`),
                    }))}
                    hasActiveSubscription={hasActiveSubscription}
                    locale={locale}
                    unlockLabel={t("unlock")}
                    subscribersLabel={t("subscribers")}
                  />
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
