import { RecuperarForm } from "./components/recuperar-form"
import Link from "next/link"
import Image from "next/image"

export default function RecuperarPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo-odiseo.png"
            alt="Odiseo"
            width={64}
            height={64}
            className="rounded-full"
          />
          <Link href="/landing" className="text-sm font-medium">
            Odiseo
          </Link>
        </div>
        <RecuperarForm />
      </div>
    </div>
  )
}
