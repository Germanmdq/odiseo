"use client"

import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const t = useTranslations("auth.login")
  const locale = useLocale()
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")

    startTransition(async () => {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError("Email o contraseña incorrectos")
        return
      }

      router.replace(`/${locale}/dashboard`)
      router.refresh()
    })
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm text-balance">{t("subtitle")}</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" placeholder="hola@ejemplo.com" autoComplete="email" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">{t("password")}</Label>
            <Link
              href={`/${locale}/recuperar`}
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
          {isPending ? "Ingresando..." : t("submit")}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            {t("orContinueWith")}
          </span>
        </div>
        <Button variant="outline" className="w-full cursor-pointer" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          {t("continueWithGoogle")}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t("noAccount")}{" "}
        <Link href={`/${locale}/registro`} className="underline underline-offset-4">
          {t("signUp")}
        </Link>
      </div>
    </form>
  )
}
