"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { useTranslations, useLocale } from "next-intl"
import { useNombrePreferido } from "@/hooks/use-nombre-preferido"
import { PLANES, type PlanId } from "@/lib/planes"

const profileFormSchema = z.object({
  nombrePreferido: z.string().min(1, "Requerido"),
  fullName: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

type ProfileData = {
  email: string
  fullName: string
  nombrePreferido: string
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function PerfilPage() {
  const t = useTranslations("settings.perfil")
  const router = useRouter()
  const locale = useLocale()
  const nombre = useNombrePreferido()
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [email, setEmail] = useState("")
  const [estadoSub, setEstadoSub] = useState<{
    suscripto: boolean
    plan: string | null
    currentPeriodEnd: string | null
  } | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nombrePreferido: "",
      fullName: "",
    },
  })

  useEffect(() => {
    fetch("/api/perfil", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: ProfileData) => {
        setEmail(d.email ?? "")
        form.reset({
          nombrePreferido: d.nombrePreferido ?? "",
          fullName: d.fullName ?? "",
        })
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [form])

  // Estado de suscripción — se muestra SIEMPRE (gratis o con plan activo)
  useEffect(() => {
    fetch("/api/suscripcion/estado", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { suscripto?: boolean; plan?: string | null; currentPeriodEnd?: string | null }) => {
        setEstadoSub({
          suscripto: !!d.suscripto,
          plan: d.plan ?? null,
          currentPeriodEnd: d.currentPeriodEnd ?? null,
        })
      })
      .catch(() => setEstadoSub({ suscripto: false, plan: null, currentPeriodEnd: null }))
  }, [])

  async function onSubmit(data: ProfileFormValues) {
    setStatus("saving")
    try {
      const r = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!r.ok) throw new Error()
      setStatus("saved")
      // Invalidar caches de Next (sidebar, dashboard, coach) para que tomen el nombre nuevo
      router.refresh()
      setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {nombre ? `${nombre}, actualizá tu información personal.` : t("subtitle")}
              </CardDescription>
              {estadoSub && (
                estadoSub.suscripto && estadoSub.plan ? (
                  <Link
                    href={`/${locale}/configuracion/suscripcion`}
                    className="mt-2 inline-flex w-fit flex-col gap-0.5 no-underline"
                  >
                    <Badge className="w-fit bg-[#E8401A] hover:bg-[#E8401A]/90 text-white border-transparent">
                      Plan activo: {estadoSub.plan in PLANES ? PLANES[estadoSub.plan as PlanId].nombre : estadoSub.plan}
                    </Badge>
                    {estadoSub.currentPeriodEnd && (
                      <span className="text-xs text-muted-foreground">
                        Renueva el {formatFecha(estadoSub.currentPeriodEnd)}
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="w-fit">
                      Plan: Gratis (3 usos incluidos)
                    </Badge>
                    <Link
                      href={`/${locale}/pricing`}
                      className="text-xs font-medium text-[#E8401A] hover:underline"
                    >
                      Suscribirme
                    </Link>
                  </div>
                )
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* nombre_preferido — highlighted */}
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="nombrePreferido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        {t("nombrePreferido")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("nombrePreferidoPlaceholder")}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t("nombrePreferidoHint")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fullName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ana García"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input value={email} disabled readOnly className="opacity-60" />
                  </FormControl>
                  <FormDescription>El email no se puede cambiar desde acá.</FormDescription>
                </FormItem>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || status === "saving"}
                  className="cursor-pointer"
                >
                  {status === "saving" ? "Guardando..." : t("save")}
                </Button>
                {status === "saved" && (
                  <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    {t("saved")}
                  </span>
                )}
                {status === "error" && (
                  <span className="text-sm text-destructive">{t("errorSaving")}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
