"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type Author } from "../data"

interface CoachHeaderProps {
  author: Author | null
}

export function CoachHeader({ author }: CoachHeaderProps) {
  const t = useTranslations("coach")

  if (!author) {
    return (
      <div className="flex items-center h-full">
        <p className="text-muted-foreground text-sm">{t("selectTitle")}</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 h-full">
      <Avatar className="h-9 w-9 flex-shrink-0 border border-[#EEEEEE] sm:h-10 sm:w-10">
        <AvatarImage src={author.photo} alt={author.name} />
        <AvatarFallback className={cn("text-white font-medium", author.color || "bg-gray-500")}>
          {author.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h2 className="truncate text-base font-bold text-black sm:text-lg">{author.name}</h2>
        <p className="truncate text-xs text-black/50 sm:text-sm">{t("readyToChat")}</p>
      </div>
    </div>
  )
}
