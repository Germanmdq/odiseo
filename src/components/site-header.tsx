"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"

export function SiteHeader() {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [notifCount, setNotifCount] = React.useState(0)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    fetch("/api/notificaciones/count")
      .then((r) => r.json())
      .then((d: { count?: number }) => setNotifCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  const pathname = usePathname()
  const isCoachRoute = pathname?.includes("/coach") || pathname?.includes("/conversar")

  return (
    <>
      <header className={`flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) ${isCoachRoute ? "hidden md:flex" : ""}`}>
        <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
          <Separator
            orientation="vertical"
            className="mx-2 hidden data-[orientation=vertical]:h-4 md:block"
          />
          <div className="flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
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
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
