"use client"

import * as React from "react"
import Link from "next/link"
import { Lock } from "lucide-react"

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
          <div
            key={index}
            role={!hasActiveSubscription ? "button" : undefined}
            tabIndex={!hasActiveSubscription ? 0 : undefined}
            onClick={!hasActiveSubscription ? () => setShowPopup(true) : undefined}
            className="flex items-center gap-3 px-3 py-3 sm:px-4"
            aria-disabled={!hasActiveSubscription}
          >
            <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-medium tabular-nums">
              {index + 1}
            </span>
            <p className="flex-1 text-sm font-medium">{leccion.label}</p>
            {!hasActiveSubscription && (
              <>
                <Lock className="text-muted-foreground size-4 shrink-0" />
                <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                  {subscribersLabel}
                </Badge>
              </>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-sm text-center space-y-4 p-8">
          <DialogTitle className="sr-only">Solo disponible para plan anual</DialogTitle>
          <div
            className="size-12 rounded-full flex items-center justify-center mx-auto text-white"
            style={{ backgroundColor: "#E8401A" }}
          >
            <Lock className="size-6" />
          </div>
          <h2 className="text-xl font-semibold">Solo disponible para plan anual</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Los Talleres son exclusivos del plan anual. Accedés a 8 talleres por año
            con Germán y Taty.
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
    </div>
  )
}
