"use client"

import * as React from "react"
import { ChevronDown, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useSidebar } from "@/components/ui/sidebar"

export function NavMain({
  label,
  items,
  dimmed = false,
  onOpenChange,
}: {
  label: string
  dimmed?: boolean
  onOpenChange?: (open: boolean) => void
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const normalizedPathname = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/"

  const groupHasActiveItem = items.some(
    (item) => normalizedPathname === item.url || item.isActive
  )
  const [isGroupOpen, setIsGroupOpen] = React.useState(groupHasActiveItem)

  const handleOpenChange = (open: boolean) => {
    setIsGroupOpen(open)
    onOpenChange?.(open)
  }

  React.useEffect(() => {
    if (groupHasActiveItem) {
      setIsGroupOpen(true)
      onOpenChange?.(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupHasActiveItem])

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Collapsible open={isGroupOpen} onOpenChange={handleOpenChange}
      className={["transition-opacity duration-200", dimmed ? "opacity-40" : "opacity-100"].join(" ")}
    >
      {/* Header colapsable — misma píldora que los items sueltos */}
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={[
            "flex w-full items-center justify-between rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer",
            isGroupOpen
              ? "bg-black text-white"
              : "bg-[#FF2B0A] text-white hover:bg-[#e02500]",
          ].join(" ")}
        >
          <span>{label}</span>
          <ChevronDown
            className={[
              "size-4 transition-transform duration-200",
              isGroupOpen ? "" : "-rotate-90",
            ].join(" ")}
          />
        </button>
      </CollapsibleTrigger>

      {/* Items desplegados */}
      <CollapsibleContent>
        <div className="mt-1 flex flex-col gap-0.5 pl-2">
          {items.map((item) => {
            const active = normalizedPathname === item.url || item.isActive
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={closeMobileSidebar}
                className={[
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-[#FF2B0A] text-white"
                    : "text-black hover:bg-[#FF2B0A]/10 hover:text-[#FF2B0A]",
                ].join(" ")}
              >
                {item.icon && <item.icon className="size-4 shrink-0" />}
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
