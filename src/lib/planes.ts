export const PLANES = {
  semanal: {
    nombre: "Semanal",
    precio_usd: 5,
    precio_ars: 7000,
    periodo: "weekly",
    incluye_talleres: false,
    descripcion: "Acceso completo a Coach, Narrador, Biblioteca y Mi libro",
    features: [
      "Coach IA con todos los maestros",
      "Creador de escenas ilimitado",
      "Biblioteca de fuentes completa",
      "Memoria personal",
      "Evaluaciones de conocimientos",
    ],
  },
  mensual: {
    nombre: "Mensual",
    precio_usd: 9,
    precio_ars: 12000,
    periodo: "monthly",
    incluye_talleres: false,
    descripcion: "Todo lo del plan semanal, al mejor precio mensual",
    features: [
      "Coach IA con todos los maestros",
      "Creador de escenas ilimitado",
      "Biblioteca de fuentes completa",
      "Memoria personal",
      "Evaluaciones de conocimientos",
      "Mi libro en construcción",
    ],
    badge: "Más elegido",
  },
  anual: {
    nombre: "Anual",
    precio_usd: 47,
    precio_ars: 55000,
    periodo: "annual",
    incluye_talleres: true,
    descripcion: "Todo + acceso completo a los Talleres de Germán y Taty",
    features: [
      "Coach IA con todos los maestros",
      "Creador de escenas ilimitado",
      "Biblioteca de fuentes completa",
      "Memoria personal",
      "Evaluaciones de conocimientos",
      "Mi libro en construcción",
      "Talleres en video (plan anual exclusivo)",
      "Equivale a $3,9 USD/mes",
    ],
    badge: "Mejor precio",
  },
} as const

export type PlanId = keyof typeof PLANES

export function calcularPeriodEnd(periodo: string): string {
  const now = new Date()
  switch (periodo) {
    case "weekly":
      now.setDate(now.getDate() + 7)
      break
    case "monthly":
      now.setMonth(now.getMonth() + 1)
      break
    case "annual":
      now.setFullYear(now.getFullYear() + 1)
      break
  }
  return now.toISOString()
}

export function isPlanId(value: string): value is PlanId {
  return value in PLANES
}
