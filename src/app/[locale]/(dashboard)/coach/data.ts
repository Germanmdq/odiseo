export const AUTHORS = [
  { id: "neville", name: "Neville Goddard", initials: "NG", color: "bg-orange-500" },
  { id: "murphy", name: "Joseph Murphy", initials: "JM", color: "bg-sky-600" },
  { id: "fox", name: "Emmet Fox", initials: "EF", color: "bg-emerald-600" },
  { id: "scovel-shinn", name: "Florence Scovel Shinn", initials: "FS", color: "bg-violet-500" },
] as const

export type Author = (typeof AUTHORS)[number]
