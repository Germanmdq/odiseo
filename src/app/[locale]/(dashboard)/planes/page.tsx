"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormData = {
  deseo: string
  nombre: string
  edad: string
  paisCiudad: string
  trabaja: boolean | null
  ocupacion: string
  estadoCivil: string
  tieneHijos: boolean | null
  cantidadHijos: string
  conoceNeville: string
  horaDespertar: string
  horaDormir: string
  duracionDias: string
  mensajeExtra: string
}

const INITIAL: FormData = {
  deseo: "",
  nombre: "",
  edad: "",
  paisCiudad: "",
  trabaja: null,
  ocupacion: "",
  estadoCivil: "",
  tieneHijos: null,
  cantidadHijos: "",
  conoceNeville: "",
  horaDespertar: "",
  horaDormir: "",
  duracionDias: "30",
  mensajeExtra: "",
}

export default function PlanesPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.deseo.trim() || !form.nombre.trim()) {
      setError("El deseo y tu nombre son obligatorios.")
      return
    }
    setEnviando(true)
    setError(null)

    const res = await fetch("/api/planes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setEnviando(false)
    if (res.ok) {
      setEnviado(true)
    } else {
      setError("Hubo un error al enviar. Intentá de nuevo.")
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
        <div className="size-16 rounded-full flex items-center justify-center text-white text-2xl"
          style={{ backgroundColor: "#E8401A" }}>
          ✓
        </div>
        <h2 className="text-2xl font-semibold">Tu solicitud fue enviada</h2>
        <p className="text-muted-foreground max-w-md">
          Germán va a revisar tu caso y prepararte un plan personalizado. 
          Cuando esté listo, lo vas a ver en Mensajes.
        </p>
        <Button variant="outline" onClick={() => router.push("mensajes")}>
          Ir a Mensajes
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Pedir un plan personalizado</h1>
        <p className="text-muted-foreground mt-1">
          Germán prepara un plan de práctica diaria hecho para vos. 
          Cuanto más detalle des, mejor va a ser el plan.
        </p>
      </div>

      {/* SECCIÓN 1 — Tu deseo */}
      <section className="space-y-3">
        <h2 className="font-semibold text-base border-b pb-2">Tu deseo</h2>
        <Label>¿Qué querés manifestar? <span className="text-destructive">*</span></Label>
        <Textarea
          value={form.deseo}
          onChange={e => set("deseo", e.target.value)}
          placeholder="Contá con el mayor detalle posible qué querés lograr, cómo es tu situación actual y qué intentaste hasta ahora..."
          className="min-h-[140px] resize-none"
        />
      </section>

      {/* SECCIÓN 2 — Tu vida actual */}
      <section className="space-y-4">
        <h2 className="font-semibold text-base border-b pb-2">Tu vida actual</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nombre <span className="text-destructive">*</span></Label>
            <Input
              value={form.nombre}
              onChange={e => set("nombre", e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Edad</Label>
            <Input
              type="number"
              value={form.edad}
              onChange={e => set("edad", e.target.value)}
              placeholder="Tu edad"
              min={1} max={120}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>País y ciudad</Label>
          <Input
            value={form.paisCiudad}
            onChange={e => set("paisCiudad", e.target.value)}
            placeholder="Ej: Argentina, Buenos Aires"
          />
        </div>

        {/* ¿Trabajás? */}
        <div className="space-y-2">
          <Label>¿Trabajás actualmente?</Label>
          <div className="flex gap-3">
            {[
              { label: "Sí", value: true },
              { label: "No", value: false },
            ].map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => set("trabaja", opt.value)}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors ${
                  form.trabaja === opt.value
                    ? "text-white border-transparent"
                    : "hover:bg-muted"
                }`}
                style={form.trabaja === opt.value ? { backgroundColor: "#E8401A", borderColor: "#E8401A" } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {form.trabaja && (
          <div className="space-y-1.5">
            <Label>¿En qué trabajás?</Label>
            <Input
              value={form.ocupacion}
              onChange={e => set("ocupacion", e.target.value)}
              placeholder="Tu ocupación o trabajo actual"
            />
          </div>
        )}

        {/* Estado civil */}
        <div className="space-y-2">
          <Label>Estado civil</Label>
          <div className="flex flex-wrap gap-2">
            {["Soltero/a", "En pareja", "Casado/a", "Divorciado/a", "Viudo/a"].map(opt => (
              <button
                key={opt}
                onClick={() => set("estadoCivil", opt)}
                className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                  form.estadoCivil === opt ? "text-white border-transparent" : "hover:bg-muted"
                }`}
                style={form.estadoCivil === opt ? { backgroundColor: "#E8401A", borderColor: "#E8401A" } : {}}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Hijos */}
        <div className="space-y-2">
          <Label>¿Tenés hijos?</Label>
          <div className="flex gap-3">
            {[
              { label: "No", value: false },
              { label: "Sí", value: true },
            ].map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => set("tieneHijos", opt.value)}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors ${
                  form.tieneHijos === opt.value ? "text-white border-transparent" : "hover:bg-muted"
                }`}
                style={form.tieneHijos === opt.value ? { backgroundColor: "#E8401A", borderColor: "#E8401A" } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {form.tieneHijos && (
          <div className="space-y-1.5">
            <Label>¿Cuántos hijos?</Label>
            <Input
              type="number"
              value={form.cantidadHijos}
              onChange={e => set("cantidadHijos", e.target.value)}
              placeholder="Cantidad"
              min={1} max={20}
            />
          </div>
        )}

        {/* Conoce a Neville */}
        <div className="space-y-2">
          <Label>¿Hace cuánto conocés las enseñanzas?</Label>
          <div className="flex flex-wrap gap-2">
            {["Recién empiezo", "Algunos meses", "Más de un año", "Varios años"].map(opt => (
              <button
                key={opt}
                onClick={() => set("conoceNeville", opt)}
                className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                  form.conoceNeville === opt ? "text-white border-transparent" : "hover:bg-muted"
                }`}
                style={form.conoceNeville === opt ? { backgroundColor: "#E8401A", borderColor: "#E8401A" } : {}}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 3 — Tu práctica */}
      <section className="space-y-4">
        <h2 className="font-semibold text-base border-b pb-2">Tu práctica</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>¿A qué hora te despertás?</Label>
            <Input
              type="time"
              value={form.horaDespertar}
              onChange={e => set("horaDespertar", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>¿A qué hora te dormís?</Label>
            <Input
              type="time"
              value={form.horaDormir}
              onChange={e => set("horaDormir", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>¿Cuántos días querés que dure el plan?</Label>
          <div className="flex gap-3">
            {["7", "15", "30"].map(opt => (
              <button
                key={opt}
                onClick={() => set("duracionDias", opt)}
                className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${
                  form.duracionDias === opt ? "text-white border-transparent" : "hover:bg-muted"
                }`}
                style={form.duracionDias === opt ? { backgroundColor: "#E8401A", borderColor: "#E8401A" } : {}}
              >
                {opt} días
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 4 — Extra */}
      <section className="space-y-3">
        <h2 className="font-semibold text-base border-b pb-2">¿Algo más?</h2>
        <Textarea
          value={form.mensajeExtra}
          onChange={e => set("mensajeExtra", e.target.value)}
          placeholder="Cualquier cosa que quieras agregarle a Germán..."
          className="min-h-[100px] resize-none"
        />
      </section>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={enviando}
        className="w-full h-12 text-base font-medium text-white cursor-pointer"
        style={{ backgroundColor: "#E8401A" }}
      >
        {enviando ? (
          <><Loader2 className="size-4 animate-spin mr-2" /> Enviando...</>
        ) : (
          <><Send className="size-4 mr-2" /> Enviar solicitud a Germán</>
        )}
      </Button>
    </div>
  )
}
