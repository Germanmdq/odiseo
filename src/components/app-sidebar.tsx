"use client"

import * as React from "react"
import {
  Home,
  Mail,
  MessageSquareText,
  StickyNote,
  Calendar,
  GraduationCap,
  Library,
  Settings,
  HelpCircle,
  MessageCircle,
  ScrollText,
  Cross,
  Sparkles,
  Brain,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
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

const data = {
  user: {
    name: "Usuario",
    email: "",
    avatar: "",
  },
  navGroups: [
    {
      label: "Principal",
      items: [
        {
          title: "Inicio",
          url: "/dashboard",
          icon: Home,
        },
      ],
    },
    {
      label: "Apps",
      items: [
        {
          title: "Coach",
          url: "/coach",
          icon: MessageSquareText,
        },
        {
          title: "Creador de escenas",
          url: "/creador-de-escenas",
          icon: Sparkles,
        },
        {
          title: "Mensajes",
          url: "/mensajes",
          icon: Mail,
        },
        {
          title: "Notas",
          url: "/notas",
          icon: StickyNote,
        },
        {
          title: "Mi actividad",
          url: "/actividad",
          icon: Calendar,
        },
        {
          title: "Foro",
          url: "/foro",
          icon: MessageCircle,
        },
      ],
    },
    {
      label: "Personal",
      items: [
        {
          title: "Memoria",
          url: "/memoria",
          icon: Brain,
        },
        {
          title: "Mi libro",
          url: "/mi-libro",
          icon: BookOpen,
        },
      ],
    },
    {
      label: "Estudio",
      items: [
        {
          title: "Fuentes",
          url: "/fuentes",
          icon: Library,
        },
        {
          title: "Testimonios y casos",
          url: "/testimonios",
          icon: ScrollText,
        },
        {
          title: "Biblia metafísica",
          url: "/biblia",
          icon: Cross,
        },
        {
          title: "Preguntas y respuestas",
          url: "/preguntas",
          icon: HelpCircle,
        },
        {
          title: "Talleres",
          url: "/talleres",
          icon: GraduationCap,
        },
      ],
    },
    {
      label: "Pages",
      items: [
        {
          title: "Configuración",
          url: "#",
          icon: Settings,
          items: [
            { title: "Perfil", url: "/settings/user" },
            { title: "Suscripción", url: "/settings/billing" },
            { title: "Apariencia", url: "/settings/appearance" },
            { title: "Notificaciones", url: "/settings/notifications" },
          ],
        },
        {
          title: "FAQs",
          url: "/faqs",
          icon: HelpCircle,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(data.user)

  React.useEffect(() => {
    let active = true

    async function loadUser() {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!active || !authUser) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, display_name, email, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle()

      const name =
        profile?.display_name ||
        profile?.full_name ||
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email ||
        "Usuario"

      setUser({
        name,
        email: profile?.email || authUser.email || "",
        avatar: profile?.avatar_url || "",
      })
    }

    loadUser()

    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Odiseo</span>
                  <span className="truncate text-xs">Universidad de la Imaginación</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarRacha />
        <SidebarNotification />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
