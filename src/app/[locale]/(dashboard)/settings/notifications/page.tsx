"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle } from "lucide-react"
import { toast } from "sonner"

type NotifConfig = {
  novedadesPlataforma: boolean
  nuevosTalleres: boolean
  recordatorioPractica: boolean
  resumenSemanal: boolean
}

const defaults: NotifConfig = {
  novedadesPlataforma: true,
  nuevosTalleres: true,
  recordatorioPractica: false,
  resumenSemanal: true,
}

export default function NotificacionesPage() {
  const [config, setConfig] = useState<NotifConfig>(defaults)
  const [saved, setSaved] = useState(false)

  const toggle = (key: keyof NotifConfig) =>
    setConfig(prev => ({ ...prev, [key]: !prev[key] }))

  const handleSave = () => {
    setSaved(true)
    toast.success("Preferencias guardadas")
    setTimeout(() => setSaved(false), 3000)
  }

  const items: { key: keyof NotifConfig; title: string; desc: string }[] = [
    {
      key: "novedadesPlataforma",
      title: "Novedades de Odiseo",
      desc: "Nuevas funciones, mejoras y actualizaciones importantes de la plataforma.",
    },
    {
      key: "nuevosTalleres",
      title: "Nuevos talleres",
      desc: "Te avisamos cuando haya un nuevo taller disponible de Germán y Taty.",
    },
    {
      key: "recordatorioPractica",
      title: "Recordatorio diario",
      desc: "Un email diario para recordarte practicar la escena o la técnica del día.",
    },
    {
      key: "resumenSemanal",
      title: "Resumen semanal",
      desc: "Un resumen de tu actividad, notas y progreso de la semana.",
    },
  ]

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <p className="text-muted-foreground">
          Elegí qué emails querés recibir de Odiseo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones por email</CardTitle>
          <CardDescription>
            Solo enviamos emails relevantes — sin spam.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {items.map((item, i) => (
            <div key={item.key}>
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={config[item.key]}
                  onCheckedChange={() => toggle(item.key)}
                  className="ml-6 shrink-0 cursor-pointer"
                />
              </div>
              {i < items.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="cursor-pointer">
          Guardar preferencias
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Guardado
          </span>
        )}
      </div>
    </div>
  )
}
