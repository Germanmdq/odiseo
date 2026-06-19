"use client"

import * as React from "react"
import Link from "next/link"
import { Clock, Lock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type Leccion = { label: string }

export function LeccionesBloqueables({
  lessons,
  hasActiveSubscription,
  locale,
  unlockLabel,
  subscribersLabel,
}: {
  lessons: Leccion[]
  hasActiveSubscription: boolean
  locale: string
  unlockLabel: string
  subscribersLabel: string
}) {
  const [showPopup, setShowPopup] = React.useState(false)
  const [showSoonPopup, setShowSoonPopup] = React.useState(false)

  return (
    <div className="relative overflow-hidden rounded-xl border border-black/10">
      {!hasActiveSubscription ? (
        <button
          type="button"
          onClick={() => setShowPopup(true)}
          className="bg-background/90 absolute inset-x-3 top-3 z-10 flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium shadow-sm backdrop-blur"
        >
          <Lock className="size-4" />
          {unlockLabel}
        </button>
      ) : null}

      <div className={hasActiveSubscription ? "divide-y" : "divide-y pt-14 opacity-60"}>
        {lessons.map((leccion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (hasActiveSubscription) {
                setShowSoonPopup(true)
              } else {
                setShowPopup(true)
              }
            }}
            className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50 sm:px-4"
            aria-disabled={!hasActiveSubscription}
          >
            <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-medium tabular-nums">
              {index + 1}
            </span>
            <p className="flex-1 text-sm font-medium">{leccion.label}</p>
            {hasActiveSubscription ? (
              <Clock className="text-muted-foreground size-4 shrink-0" />
            ) : (
              <>
                <Lock className="text-muted-foreground size-4 shrink-0" />
                <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                  {subscribersLabel}
                </Badge>
              </>
            )}
          </button>
        ))}
      </div>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-sm text-center space-y-4 p-8">
          <DialogTitle className="text-xl font-semibold">
            Incluido en la suscripción anual
          </DialogTitle>
          <div
            className="size-12 rounded-full flex items-center justify-center mx-auto text-white"
            style={{ backgroundColor: "#E8401A" }}
          >
            <Lock className="size-6" />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Los talleres son exclusivos del plan anual. Incluye estos talleres y
            8 encuentros nuevos durante el año, a medida que los vayamos publicando.
          </p>
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex items-center justify-center w-full rounded-full py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#E8401A" }}
            onClick={() => setShowPopup(false)}
          >
            Ver planes →
          </Link>
          <button
            onClick={() => setShowPopup(false)}
            className="text-sm text-muted-foreground hover:underline"
          >
            Cerrar
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={showSoonPopup} onOpenChange={setShowSoonPopup}>
        <DialogContent className="max-w-sm text-center space-y-4 p-8">
          <DialogTitle className="text-xl font-semibold">Próximamente</DialogTitle>
          <div
            className="size-12 rounded-full flex items-center justify-center mx-auto text-white"
            style={{ backgroundColor: "#E8401A" }}
          >
            <Clock className="size-6" />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Esta lección ya está incluida en tu plan anual, pero todavía no la
            subimos. Va a aparecer acá apenas esté disponible.
          </p>
          <button
            onClick={() => setShowSoonPopup(false)}
            className="inline-flex w-full items-center justify-center rounded-full py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#E8401A" }}
          >
            Entendido
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
