"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command as CommandPrimitive } from "cmdk"
import {
  Search,
  LayoutDashboard,
  MessageSquareText,
  Brain,
  BookOpen,
  Library,
  ScrollText,
  Cross,
  HelpCircle,
  GraduationCap,
  Settings,
  Sparkles,
  FileText,
  type LucideIcon,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    className={cn(
      "flex h-12 w-full border-none bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 mb-4",
      className
    )}
    {...props}
  />
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[400px] overflow-y-auto overflow-x-hidden pb-2", className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="flex h-12 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-zinc-500 dark:[&_[cmdk-group-heading]]:text-zinc-400 [&:not(:first-child)]:mt-2",
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-4 text-sm text-zinc-700 dark:text-zinc-300 outline-none transition-colors data-[disabled=true]:pointer-events-none data-[selected=true]:bg-zinc-100 dark:data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-900 dark:data-[selected=true]:text-zinc-100 data-[disabled=true]:opacity-50 [&+[cmdk-item]]:mt-1",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

interface NavItem {
  title: string
  url: string
  group: string
  icon?: LucideIcon
}

interface ContentItem {
  id: string
  title: string
  excerpt: string
  url: string
}

interface ContentGroup {
  title: string
  url: string
  items: ContentItem[]
}

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NAV_ITEMS: NavItem[] = [
  { title: "Inicio", url: "/dashboard", group: "Principal", icon: LayoutDashboard },
  { title: "Coach", url: "/coach", group: "Apps", icon: MessageSquareText },
  { title: "Creador de escenas", url: "/creador-de-escenas", group: "Apps", icon: Sparkles },
  { title: "Memoria", url: "/memoria", group: "Personal", icon: Brain },
  { title: "Mi libro", url: "/mi-libro", group: "Personal", icon: BookOpen },
  { title: "Fuentes", url: "/fuentes", group: "Estudio", icon: Library },
  { title: "Testimonios y casos", url: "/testimonios", group: "Estudio", icon: ScrollText },
  { title: "Biblia metafísica", url: "/biblia", group: "Estudio", icon: Cross },
  { title: "Preguntas y respuestas", url: "/preguntas", group: "Estudio", icon: HelpCircle },
  { title: "Talleres", url: "/talleres", group: "Estudio", icon: GraduationCap },
  { title: "Perfil", url: "/settings/user", group: "Configuración", icon: Settings },
  { title: "Apariencia", url: "/settings/appearance", group: "Configuración", icon: Settings },
  { title: "Notificaciones", url: "/settings/notifications", group: "Configuración", icon: Settings },
  { title: "FAQs", url: "/faqs", group: "Páginas", icon: HelpCircle },
]

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter()
  const commandRef = React.useRef<HTMLDivElement>(null)
  const [query, setQuery] = React.useState("")
  const [contentGroups, setContentGroups] = React.useState<ContentGroup[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setContentGroups([])
    }
  }, [open])

  React.useEffect(() => {
    if (query.length < 2) {
      setContentGroups([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`)
        if (r.ok) {
          const d = (await r.json()) as { groups?: ContentGroup[] }
          setContentGroups(d.groups ?? [])
        }
      } catch {
        // silently ignore
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (url: string) => {
    router.push(url)
    onOpenChange(false)
    if (commandRef.current) {
      commandRef.current.style.transform = "scale(0.96)"
      setTimeout(() => {
        if (commandRef.current) {
          commandRef.current.style.transform = ""
        }
      }, 100)
    }
  }

  const filteredNavItems = query.length === 0
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      )

  const groupedNav = filteredNavItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = []
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, NavItem[]>
  )

  const hasResults = filteredNavItems.length > 0 || contentGroups.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-[640px]">
        <DialogTitle className="sr-only">Buscar</DialogTitle>
        <Command
          ref={commandRef}
          shouldFilter={false}
          className="transition-transform duration-100 ease-out"
        >
          <CommandInput
            placeholder="Buscar..."
            autoFocus
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {!hasResults && !isSearching && (
              <CommandEmpty>Sin resultados.</CommandEmpty>
            )}
            {isSearching && (
              <CommandEmpty>Buscando...</CommandEmpty>
            )}

            {/* Static nav items */}
            {Object.entries(groupedNav).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.url}
                      value={item.title}
                      onSelect={() => handleSelect(item.url)}
                      className="h-12"
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4 shrink-0" />}
                      {item.title}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}

            {/* Content search results */}
            {contentGroups.map((group) => (
              <CommandGroup key={group.title} heading={group.title}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`content-${item.id}`}
                    onSelect={() => handleSelect(item.url)}
                    className="h-auto py-2"
                  >
                    <FileText className="mr-2 h-4 w-4 shrink-0 text-zinc-400" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{item.title}</span>
                      {item.excerpt && (
                        <span className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                          {item.excerpt}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 relative w-full justify-start text-muted-foreground sm:pr-12 md:w-36 lg:w-56"
    >
      <Search className="mr-2 h-3.5 w-3.5" />
      <span className="hidden lg:inline-flex">Buscar...</span>
      <span className="inline-flex lg:hidden">Buscar...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}
