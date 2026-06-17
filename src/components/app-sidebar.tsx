"use client"

import * as React from "react"
import {
  Home,
  Mail,
  MessageSquareText,
  PenLine,
  Calendar,
  GraduationCap,
  Library,
  HelpCircle,
  MessageCircle,
  ScrollText,
  Cross,
  Sparkles,
  Brain,
  BookOpen,
  StickyNote,
  LayoutList,
  User,
} from "lucide-react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"
import { SidebarRacha } from "@/components/sidebar-racha"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { title: "Inicio", url: "/dashboard", icon: Home },
      { title: "Cómo se usa", url: "/faqs", icon: HelpCircle },
    ],
  },
  {
    label: "Conversar",
    items: [
      { title: "Coach", url: "/coach", icon: MessageSquareText },
      { title: "Creador de escenas", url: "/creador-de-escenas", icon: Sparkles },
      { title: "Ponerme a prueba", url: "/preguntas", icon: HelpCircle },
    ],
  },
  {
    label: "Mi espacio",
    items: [
      { title: "Mensajes", url: "/mensajes", icon: Mail },
      { title: "Diario", url: "/diario", icon: PenLine },
      { title: "Notas", url: "/notas", icon: StickyNote },
      { title: "Foro", url: "/foro", icon: MessageCircle },
      { title: "Planes", url: "/planes", icon: LayoutList },
      { title: "Mi libro", url: "/mi-libro", icon: BookOpen },
    ],
  },
  {
    label: "Estudio",
    items: [
      { title: "Fuentes", url: "/fuentes", icon: Library },
      { title: "Testimonios y casos", url: "/testimonios", icon: ScrollText },
      { title: "Biblia metafísica", url: "/biblia", icon: Cross },
      { title: "Talleres", url: "/talleres", icon: GraduationCap },
    ],
  },
  {
    label: "Yo",
    items: [
      { title: "Mi actividad", url: "/actividad", icon: Calendar },
      { title: "Memoria", url: "/memoria", icon: Brain },
      { title: "Perfil", url: "/configuracion/perfil", icon: User },
    ],
  },
]

const DEFAULT_USER = { name: "", email: "", avatar: "" }

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(DEFAULT_USER)
  const [openGroup, setOpenGroup] = React.useState<string | null>(null)
  const locale = useLocale()
  const pathname = usePathname()
  const normalizedPathname = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/"

  React.useEffect(() => {
    let active = true

    async function loadUser() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!active || !authUser) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle()

      const p = (profile ?? {}) as Record<string, unknown>
      const name =
        (p.nombre_preferido as string | undefined) ||
        (authUser.user_metadata?.nombre_preferido as string | undefined) ||
        (p.display_name as string | undefined) ||
        (p.full_name as string | undefined) ||
        (authUser.user_metadata?.full_name as string | undefined) ||
        (authUser.user_metadata?.name as string | undefined) ||
        authUser.email ||
        ""

      if (active) {
        setUser({
          name,
          email: profile?.email || authUser.email || "",
          avatar: profile?.avatar_url || "",
        })
      }
    }

    loadUser()

    const { data: { subscription } } = createClient().auth.onAuthStateChange(() => loadUser())
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  // Build navGroups with locale-prefixed Perfil URL
  const navGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.map(item =>
      item.url === "/configuracion/perfil"
        ? { ...item, url: `/${locale}/configuracion/perfil` }
        : item
    ),
  }))

  return (
    <Sidebar className="odiseo-app-sidebar" {...props}>
      <SidebarHeader className="px-3 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="odiseo-brand-button h-12 rounded-2xl">
              <Link href="/dashboard">
                <div className="flex aspect-square size-9 items-center justify-center rounded-2xl border-2 border-black bg-black text-white">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight text-black">ODISEO</span>
                  <span className="truncate text-xs text-black/40">Tu compañero de imaginación</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0 px-2 py-2">
        <div className="flex flex-col gap-2">
          {/* Inicio y Cómo se usa */}
          {navGroups
            .filter((g) => g.label === "Principal")
            .flatMap((g) => g.items)
            .map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={[
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer w-full",
                    normalizedPathname === item.url
                      ? "bg-black text-white"
                      : "bg-[#FF2B0A] text-white hover:bg-[#e02500]",
                  ].join(" ")}
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  <span>{item.title}</span>
                </Link>
              )
            })}
          {/* Grupos colapsables */}
          {navGroups
            .filter((g) => g.label !== "Principal")
            .map((group) => (
              <NavMain
                key={group.label}
                label={group.label}
                items={group.items}
                dimmed={openGroup !== null && openGroup !== group.label}
                onOpenChange={(open) => setOpenGroup(open ? group.label : null)}
              />
            ))}
        </div>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4">
        <SidebarRacha />
        <SidebarNotification />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
