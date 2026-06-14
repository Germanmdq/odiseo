"use client"

import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCoach } from "../use-coach"
import { AUTHORS } from "../data"

interface AuthorListProps {
  selectedAuthor: string
  onSelectAuthor: (id: string) => void
}

export function AuthorList({ selectedAuthor, onSelectAuthor }: AuthorListProps) {
  const t = useTranslations("coach")
  const { searchQuery, setSearchQuery } = useCoach()

  const filtered = AUTHORS.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header — desktop only (mobile handled by parent) */}
      <div className="hidden lg:flex items-center h-16 px-4 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold">{t("conversations")}</h2>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 cursor-text"
          />
        </div>
      </div>

      {/* Authors */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filtered.map((author) => (
            <div
              key={author.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                selectedAuthor === author.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => onSelectAuthor(author.id)}
            >
              <Avatar
                className={cn(
                  "h-12 w-12 flex-shrink-0",
                  selectedAuthor === author.id && "ring-2 ring-background"
                )}
              >
                <AvatarFallback
                  className={cn("text-sm font-semibold text-white", author.color)}
                >
                  {author.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{author.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {t("startConversation")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
