import { LoginForm } from "./components/login-form"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(`/${locale}/inicio`)

  return (
    <div className="min-h-svh grid md:grid-cols-[1.05fr_0.95fr]">
      {/* Brand side */}
      <aside className="hidden md:flex flex-col justify-between bg-black p-11 overflow-hidden relative">
        <div className="flex justify-between items-center relative z-10">
          <Link href={`/${locale}/landing`} className="flex items-center gap-2.5">
            <Image src="/logo-odiseo.png" alt="Odiseo" width={36} height={36} className="rounded-full" />
            <span className="text-white font-bold tracking-wide">Odiseo</span>
          </Link>
          <Link
            href={`/${locale}/landing`}
            className="text-[#bdbdbd] text-[13.5px] flex items-center gap-1.5 hover:text-[#FF2B0A] transition-colors"
          >
            ← Volver
          </Link>
        </div>

        <div className="relative z-10 max-w-[30ch]">
          <span className="text-[#FF2B0A] text-sm font-semibold tracking-widest uppercase">
            Universidad de la Imaginación
          </span>
          <h2 className="text-white text-[clamp(34px,3.4vw,52px)] font-bold uppercase mt-4 leading-none">
            Recordá quién estás eligiendo ser
          </h2>
          <p className="text-[#bdbdbd] text-base mt-5 leading-[1.55]">
            Conversá, estudiá, practicá y guardá memoria de tu proceso. Tu primera consulta al Coach es gratis.
          </p>
        </div>

        <div className="relative z-10 flex gap-5 text-[#777] text-[12.5px]">
          <span className="font-mono">odiseo.online</span>
          <span>Basado en las enseñanzas de Neville Goddard</span>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center bg-white px-8 py-14">
        <div className="w-full max-w-[420px]">
          <div className="flex justify-center mb-8 md:hidden">
            <Link href={`/${locale}/landing`}>
              <Image src="/logo-odiseo.png" alt="Odiseo" width={52} height={52} className="rounded-full" />
            </Link>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
