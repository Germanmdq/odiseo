"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Send, CheckCircle } from "lucide-react"
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
  const params = useParams()
  const locale = (params?.locale as string) ?? "es"
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
        <div className="size-16 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: "#E8401A" }}>
          <CheckCircle className="size-8" />
        </div>
        <h2 className="text-2xl font-semibold">Tu solicitud fue enviada</h2>
        <p className="text-muted-foreground max-w-sm">
          Para recibir tu plan tenés que tener una suscripción activa.
        </p>
        <Link
          href={`/${locale}/pricing`}
          className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: "#E8401A" }}
        >
          Ver planes →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
        {/* Header del formulario */}
        <div className="px-8 py-6 border-b" style={{ backgroundColor: "#E8401A" }}>
          <h1 className="text-2xl font-semibold text-white">Pedir un plan personalizado</h1>
          <p className="text-white/80 mt-1 text-sm">
            Germán te va a guiar con un plan personalizado que incluye: lecturas seleccionadas, ejercicios prácticos, imaginación nocturna y afirmaciones programadas que llegan a tu teléfono.
          </p>
        </div>

        {/* Contenido del formulario */}
        <div className="px-8 py-8 space-y-8">
          {/* SECCIÓN 1 — Tu deseo */}
          <section className="rounded-xl border bg-card shadow-md p-6 space-y-4">
            <h2 className="font-semibold text-base border-b pb-2">Tu deseo</h2>
            <div className="space-y-1.5">
              <Label>¿Qué te gustaría experimentar? ¿Cuál es tu deseo? <span className="text-destructive">*</span></Label>
              <Textarea
                value={form.deseo}
                onChange={e => set("deseo", e.target.value)}
                placeholder="Contá con el mayor detalle posible: ¿qué querés lograr? ¿Cómo es tu situación actual? ¿Qué intentaste hasta ahora? ¿Hay algo que te bloquea?"
                className="min-h-[180px] resize-none"
              />
            </div>
          </section>

          {/* SECCIÓN 2 — Tu vida actual */}
          <section className="rounded-xl border bg-card shadow-md p-6 space-y-4">
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
                    type="button"
                    onClick={() => set("trabaja", opt.value)}
                    className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                      form.trabaja === opt.value
                        ? "text-white border-transparent"
                        : "hover:bg-muted bg-background"
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
                    type="button"
                    onClick={() => set("estadoCivil", opt)}
                    className={`px-4 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
                      form.estadoCivil === opt ? "text-white border-transparent" : "hover:bg-muted bg-background"
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
                    type="button"
                    onClick={() => set("tieneHijos", opt.value)}
                    className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                      form.tieneHijos === opt.value ? "text-white border-transparent" : "hover:bg-muted bg-background"
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
                    type="button"
                    onClick={() => set("conoceNeville", opt)}
                    className={`px-4 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
                      form.conoceNeville === opt ? "text-white border-transparent" : "hover:bg-muted bg-background"
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
          <section className="rounded-xl border bg-card shadow-md p-6 space-y-4">
            <h2 className="font-semibold text-base border-b pb-2">Tu práctica</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>¿A qué hora te despertás?</Label>
                <div className="flex gap-2">
                  <select
                    value={form.horaDespertar.split(":")[0] ?? ""}
                    onChange={e => set("horaDespertar", `${e.target.value}:${form.horaDespertar.split(":")[1] ?? "00"}`)}
                    className="rounded-lg border px-3 py-2 text-sm bg-background flex-1"
                  >
                    <option value="">Hora</option>
                    {Array.from({length: 24}, (_, i) => (
                      <option key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.horaDespertar.split(":")[1] ?? ""}
                    onChange={e => set("horaDespertar", `${form.horaDespertar.split(":")[0] ?? "00"}:${e.target.value}`)}
                    className="rounded-lg border px-3 py-2 text-sm bg-background flex-1"
                  >
                    <option value="">Min</option>
                    {["00", "15", "30", "45"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>¿A qué hora te dormís?</Label>
                <div className="flex gap-2">
                  <select
                    value={form.horaDormir.split(":")[0] ?? ""}
                    onChange={e => set("horaDormir", `${e.target.value}:${form.horaDormir.split(":")[1] ?? "00"}`)}
                    className="rounded-lg border px-3 py-2 text-sm bg-background flex-1"
                  >
                    <option value="">Hora</option>
                    {Array.from({length: 24}, (_, i) => (
                      <option key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.horaDormir.split(":")[1] ?? ""}
                    onChange={e => set("horaDormir", `${form.horaDormir.split(":")[0] ?? "00"}:${e.target.value}`)}
                    className="rounded-lg border px-3 py-2 text-sm bg-background flex-1"
                  >
                    <option value="">Min</option>
                    {["00", "15", "30", "45"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>¿Cuántos días querés que dure el plan?</Label>
              <div className="flex gap-3">
                {["7", "15", "30"].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("duracionDias", opt)}
                    className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                      form.duracionDias === opt ? "text-white border-transparent" : "hover:bg-muted bg-background"
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
          <section className="rounded-xl border bg-card shadow-md p-6 space-y-4">
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
      </div>
    </div>
  )
}
