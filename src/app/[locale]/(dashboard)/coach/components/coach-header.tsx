"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn("text-sm font-semibold text-white", author.color)}>
          {author.initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="font-semibold leading-tight">{author.name}</h2>
        <p className="text-sm text-muted-foreground">{t("readyToChat")}</p>
      </div>
    </div>
  )
}
