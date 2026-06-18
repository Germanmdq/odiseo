export const PLANES = {
  semanal: {
    id: "semanal",
    nombre: "Semanal",
    precio_usd: 5,
    precio_ars: 7000,
    precioUSD: "$5",
    precioARS: "$7.000",
    periodo: "/ semana",
    incluye_talleres: false,
    descripcion: "Acceso completo a todas las herramientas",
    features: [
      "Coach con todos los maestros",
      "Creador de escenas ilimitado",
      "Biblioteca de fuentes completa",
      "Testimonios y Biblia metafísica",
      "Memoria personal",
      "Evaluaciones de conocimiento",
      "Mi libro personal",
    ],
    badge: null,
    destacado: false,
  },
  mensual: {
    id: "mensual",
    nombre: "Mensual",
    precio_usd: 9,
    precio_ars: 12000,
    precioUSD: "$9",
    precioARS: "$12.000",
    periodo: "/ mes",
    incluye_talleres: false,
    descripcion: "Todo lo anterior al mejor precio mensual",
    features: [
      "Coach con todos los maestros",
      "Creador de escenas ilimitado",
      "Biblioteca de fuentes completa",
      "Testimonios y Biblia metafísica",
      "Memoria personal",
      "Evaluaciones de conocimiento",
      "Mi libro personal",
    ],
    badge: "Más elegido",
    destacado: true,
  },
  anual: {
    id: "anual",
    nombre: "Anual",
    precio_usd: 47,
    precio_ars: 55000,
    precioUSD: "$47",
    precioARS: "$55.000",
    periodo: "/ año",
    incluye_talleres: true,
    descripcion: "Todo + acceso completo a los Talleres de Germán y Taty",
    features: [
      "Coach con todos los maestros",
      "Creador de escenas ilimitado",
      "Biblioteca de fuentes completa",
      "Testimonios y Biblia metafísica",
      "Memoria personal",
      "Evaluaciones de conocimiento",
      "Mi libro personal",
      "32 grabaciones de Talleres",
      "Equivale a $3,9 USD/mes",
    ],
    badge: "Talleres incluidos",
    destacado: false,
  },
} as const

export type PlanId = keyof typeof PLANES

export function calcularPeriodEnd(periodo: string): string {
  const now = new Date()
  switch (periodo) {
    case "weekly":
    case "/ semana":
      now.setDate(now.getDate() + 7)
      break
    case "monthly":
    case "/ mes":
      now.setMonth(now.getMonth() + 1)
      break
    case "annual":
    case "/ año":
      now.setFullYear(now.getFullYear() + 1)
      break
  }
  return now.toISOString()
}

export function isPlanId(value: string): value is PlanId {
  return value in PLANES
}
