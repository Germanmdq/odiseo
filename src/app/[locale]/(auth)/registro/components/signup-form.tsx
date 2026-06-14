"use client"

import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
  const t = useTranslations("auth.registro")
  const locale = useLocale()
  const router = useRouter()
  const [error, setError] = useState("")
  const [confirmationMessage, setConfirmationMessage] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setConfirmationMessage("")

    const formData = new FormData(event.currentTarget)
    const nombrePreferido = String(formData.get("nombrePreferido") || "").trim()
    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")

    if (!nombrePreferido) {
      setError("Ingresá cómo querés que te llamemos")
      return
    }

    if (!termsAccepted) {
      setError("Aceptá los términos para crear tu cuenta")
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_preferido: nombrePreferido,
            full_name: nombrePreferido,
          },
          emailRedirectTo: `${window.location.origin}/${locale}/dashboard`,
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // If session is immediately available, save nombre_preferido to profile
      if (data.session) {
        try {
          await fetch("/api/perfil", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombrePreferido }),
          })
        } catch {
          // Non-fatal — nombre_preferido is also in user_metadata as fallback
        }
        router.replace(`/${locale}/dashboard`)
        router.refresh()
        return
      }

      setConfirmationMessage("Revisá tu correo para confirmar la cuenta")
    })
  }

  if (confirmationMessage) {
    return (
      <div className={cn("flex flex-col gap-6 text-center", className)}>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Revisá tu correo</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {confirmationMessage}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href={`/${locale}/login`}>Volver al login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm text-balance">{t("subtitle")}</p>
      </div>
      <div className="grid gap-5">
        {/* Nombre preferido — destacado */}
        <div className="grid gap-2 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <Label htmlFor="nombrePreferido" className="font-semibold">
            ¿Cómo querés que te llamemos?
          </Label>
          <Input
            id="nombrePreferido"
            name="nombrePreferido"
            placeholder="Tu nombre o como preferís que te llamen"
            autoComplete="nickname"
            required
          />
          <p className="text-xs text-muted-foreground">
            El Coach y el Narrador te van a llamar así.
          </p>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" placeholder="hola@ejemplo.com" autoComplete="email" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">{t("password")}</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            className="mt-0.5"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <Label htmlFor="terms" className="text-sm leading-snug">
            {t("termsCheck")}{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              {t("termsLink")}
            </Link>{" "}
            {t("and")}{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              {t("privacyLink")}
            </Link>
          </Label>
        </div>
        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
          {isPending ? "Creando cuenta..." : t("submit")}
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
        {t("hasAccount")}{" "}
        <Link href={`/${locale}/login`} className="underline underline-offset-4">
          {t("signIn")}
        </Link>
      </div>
    </form>
  )
}
