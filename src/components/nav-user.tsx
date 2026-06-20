"use client"

import { useState, useEffect } from "react"
import {
  EllipsisVertical,
  LogOut,
  User,
} from "lucide-react"
import Link from "next/link"
import { useLocale } from "next-intl"

import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const locale = useLocale()
  const [perfil, setPerfil] = useState({
    nombre: user.name || "Usuario",
    email: user.email || "",
  })

  useEffect(() => {
    fetch("/api/perfil")
      .then((r) => r.json())
      .then((d: { nombrePreferido?: string; fullName?: string; email?: string }) =>
        setPerfil({
          nombre: d.nombrePreferido || d.fullName || d.email?.split("@")[0] || "Usuario",
          email: d.email || "",
        })
      )
  }, [])

  async function handleSignOut() {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) console.error("Error al cerrar sesión:", error)
    } catch (e) {
      console.error("Error al cerrar sesión:", e)
    } finally {
      // Redirect duro: recarga real para que el servidor lea las cookies ya
      // limpias y no quede sesión vieja en caché del router.
      window.location.assign(`/${locale}/login`)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex w-full items-center gap-1 px-1 py-1">
          {/* Avatar + nombre → perfil */}
          <Link
            href={`/${locale}/configuracion/perfil`}
            className="flex flex-1 items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors min-w-0"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Logo size={28} />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-medium">{perfil.nombre}</span>
              <span className="text-muted-foreground truncate text-xs">{perfil.email}</span>
            </div>
          </Link>

          {/* Menú "..." */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
                aria-label="Opciones de cuenta"
              >
                <EllipsisVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                    <Logo size={28} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-medium">{perfil.nombre}</span>
                    <span className="text-muted-foreground truncate text-xs">{perfil.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/${locale}/configuracion/perfil`}>
                    <User className="size-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
