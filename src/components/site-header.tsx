"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"

export function SiteHeader() {
  const router = useRouter()
  const [notifCount, setNotifCount] = React.useState(0)

  React.useEffect(() => {
    fetch("/api/notificaciones/count")
      .then((r) => r.json())
      .then((d: { count?: number }) => setNotifCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 py-3 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 inline-flex size-10 rounded-xl border border-black/15 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.10)] md:size-8" />
        <div className="flex min-w-0 items-center gap-2 md:hidden">
          <div className="flex size-8 items-center justify-center rounded-xl border-2 border-black bg-black text-white">
            <Logo size={21} className="text-current" />
          </div>
          <span className="text-sm font-bold tracking-tight text-black">ODISEO</span>
        </div>
        <Separator
          orientation="vertical"
          className="mx-2 hidden data-[orientation=vertical]:h-4 md:block"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8"
            onClick={() => router.push("/mensajes")}
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground leading-none">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
