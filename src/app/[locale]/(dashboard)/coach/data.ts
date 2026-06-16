export const AUTHORS = [
  {
    id: "asistente",
    name: "Asistente de imaginación",
    initials: "AI",
    color: "bg-[#FF2B0A]",
    photo: "",
  },
] as const

export type Author = (typeof AUTHORS)[number]
