"use client"

import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"

export function RecuperarForm({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("auth.recuperar")
  const locale = useLocale()
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "")

    startTransition(async () => {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/login`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setMessage("Te enviamos un enlace")
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                />
              </div>
              {message && (
                <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                  {message}
                </p>
              )}
              {error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
                {isPending ? "Enviando..." : t("submit")}
              </Button>
              <div className="text-center text-sm">
                {t("rememberPassword")}{" "}
                <Link href={`/${locale}/login`} className="underline underline-offset-4">
                  {t("backToSignIn")}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
