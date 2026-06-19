"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Brain,
  Calendar,
  Cross,
  GraduationCap,
  HelpCircle,
  Home,
  LayoutList,
  Library,
  Mail,
  MessageCircle,
  MessageSquareText,
  PenLine,
  ScrollText,
  Sparkles,
  StickyNote,
  User,
  type LucideIcon,
} from "lucide-react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

type MobileNavItem = {
  title: string
  url: string
  icon: LucideIcon
}

type MobileNavSection = {
  label: string
  icon: LucideIcon
  url?: string
  items?: MobileNavItem[]
}

const MOBILE_SECTIONS: MobileNavSection[] = [
  {
    label: "Inicio",
    icon: Home,
    url: "/dashboard",
  },
  {
    label: "Conversar",
    icon: MessageSquareText,
    items: [
      { title: "Coach", url: "/coach", icon: MessageSquareText },
      { title: "Creador de escenas", url: "/creador-de-escenas", icon: Sparkles },
      { title: "Ponerme a prueba", url: "/preguntas", icon: HelpCircle },
    ],
  },
  {
    label: "Espacio",
    icon: Calendar,
    items: [
      { title: "Mensajes", url: "/mensajes", icon: Mail },
      { title: "Diario", url: "/diario", icon: PenLine },
      { title: "Mi actividad", url: "/actividad", icon: Calendar },
      { title: "Notas", url: "/notas", icon: StickyNote },
      { title: "Foro", url: "/foro", icon: MessageCircle },
      { title: "Planes", url: "/planes", icon: LayoutList },
      { title: "Mi libro", url: "/mi-libro", icon: BookOpen },
    ],
  },
  {
    label: "Estudio",
    icon: Library,
    items: [
      { title: "Fuentes", url: "/fuentes", icon: Library },
      { title: "Testimonios", url: "/testimonios", icon: ScrollText },
      { title: "Biblia", url: "/biblia", icon: Cross },
      { title: "Talleres", url: "/talleres", icon: GraduationCap },
    ],
  },
  {
    label: "Yo",
    icon: Brain,
    items: [
      { title: "Memoria", url: "/memoria", icon: Brain },
      { title: "Perfil", url: "/configuracion/perfil", icon: User },
    ],
  },
]

export function AppMobileNav() {
  const locale = useLocale()
  const pathname = usePathname()
  const [openSection, setOpenSection] = React.useState<MobileNavSection | null>(null)

  const withLocale = React.useCallback((url: string) => `/${locale}${url}`, [locale])

  const isActiveSection = (section: MobileNavSection) => {
    if (section.url && pathname === withLocale(section.url)) return true
    return section.items?.some((item) => pathname === withLocale(item.url)) ?? false
  }

  const isCoachRoute = pathname.includes("/coach") || pathname.includes("/conversar")
  if (isCoachRoute) return null

  return (
    <>
      <nav className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 md:hidden">
        <div className="grid w-full max-w-[430px] grid-cols-5 rounded-full border border-white/12 bg-[#14100f]/88 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          {MOBILE_SECTIONS.map((section) => {
            const Icon = section.icon
            const active = isActiveSection(section)
            const commonClass = cn(
              "flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium transition",
              active
                ? "bg-white text-black shadow-[0_10px_30px_rgba(255,122,102,0.22)]"
                : "text-white/62 hover:bg-white/8 hover:text-white"
            )

            if (section.url) {
              return (
                <Link key={section.label} href={withLocale(section.url)} className={commonClass}>
                  <Icon className="size-4" />
                  <span>{section.label}</span>
                </Link>
              )
            }

            return (
              <button
                key={section.label}
                type="button"
                className={commonClass}
                onClick={() => setOpenSection(section)}
              >
                <Icon className="size-4" />
                <span>{section.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <Drawer open={Boolean(openSection)} onOpenChange={(open) => !open && setOpenSection(null)}>
        <DrawerContent className="border-white/10 bg-[#100d0c] text-white md:hidden">
          <DrawerHeader className="px-5 pb-2 pt-5 text-left">
            <DrawerTitle className="text-white">{openSection?.label}</DrawerTitle>
            <DrawerDescription className="text-white/48">
              Elegí una sección para continuar.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-2 px-4 pb-8">
            {openSection?.items?.map((item) => {
              const Icon = item.icon
              const href = withLocale(item.url)
              const active = pathname === href
              return (
                <DrawerClose asChild key={item.url}>
                  <Link
                    href={href}
                    onClick={() => setOpenSection(null)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "border-[#ffad9e]/40 bg-[#ff7a66]/16 text-white"
                        : "text-white/78 hover:bg-white/[0.09] hover:text-white"
                    )}
                  >
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-[#ffe1db]">
                      <Icon className="size-4" />
                    </span>
                    <span>{item.title}</span>
                  </Link>
                </DrawerClose>
              )
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
