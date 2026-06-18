import Link from "next/link"

export function Paywall({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold">Ya sentiste lo que es Odiseo.</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Para seguir practicando sin límites, elegí tu plan.
        </p>
      </div>

      <Link
        href={`/${locale}/precios`}
        className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
        style={{ backgroundColor: "#E8401A" }}
      >
        Elegí tu plan →
      </Link>
    </div>
  )
}
