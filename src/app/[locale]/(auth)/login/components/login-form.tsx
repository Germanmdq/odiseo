"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function LoginForm() {
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
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError("Email o contraseña incorrectos")
        return
      }

      router.replace(`/${locale}/dashboard`)
      router.refresh()
    })
  }

  function handleGoogle() {
    const supabase = createClient()
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/${locale}/auth/callback?next=/${locale}/dashboard`,
      },
    })
  }

  return (
    <div>
      <h1 className="text-[30px] font-bold tracking-[-0.02em] text-black leading-tight">
        {t("title")}
      </h1>
      <p className="text-[#777] text-[15px] mt-2.5">{t("subtitle")}</p>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        className="mt-7 w-full flex items-center justify-center gap-2.5 border-2 border-black rounded-full py-3 bg-white text-black text-sm font-semibold hover:bg-[#F4F4F4] transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-[18px] w-[18px]">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        {t("continueWithGoogle")}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3.5 my-5">
        <div className="flex-1 h-px bg-[#E0E0E0]" />
        <span className="text-[#999] text-[11px] font-semibold tracking-[0.1em] uppercase">{t("orContinueWith")}</span>
        <div className="flex-1 h-px bg-[#E0E0E0]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-black">{t("email")}</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="hola@ejemplo.com"
            autoComplete="email"
            required
            className="border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-[#ABABAB] outline-none focus:border-[#FF2B0A] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-black">{t("password")}</label>
            <Link
              href={`/${locale}/recuperar`}
              className="text-sm text-[#777] hover:text-[#FF2B0A] transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-[#ABABAB] outline-none focus:border-[#FF2B0A] transition-colors"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-[#FF2B0A]/30 bg-[#FF2B0A]/08 px-3 py-2 text-sm text-[#FF2B0A]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#FF2B0A] text-white rounded-full py-3 text-sm font-semibold shadow-[0_4px_14px_rgba(255,43,10,0.4)] hover:bg-[#d42209] hover:shadow-[0_6px_20px_rgba(255,43,10,0.5)] transition-all disabled:opacity-60 cursor-pointer mt-1"
        >
          {isPending ? "Ingresando..." : t("submit")}
        </button>
      </form>

      <p className="text-[12px] text-[#999] text-center mt-5 leading-[1.5]">
        {t("noAccount")}{" "}
        <Link href={`/${locale}/registro`} className="text-black underline underline-offset-4 hover:text-[#FF2B0A]">
          {t("signUp")}
        </Link>
      </p>
    </div>
  )
}
