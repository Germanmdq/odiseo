"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

type Mensaje = {
  id: string
  remitente: "usuario" | "german"
  contenido: string
  created_at: string
  leido: boolean
}

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/mensajes")
      .then(r => r.json())
      .then((data: unknown) => {
        setMensajes(Array.isArray(data) ? (data as Mensaje[]) : [])
        setCargando(false)
      })
      .catch(() => {
        setCargando(false)
      })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes])

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || enviando) return
    setEnviando(true)
    setInput("")

    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: texto }),
      })

      if (res.ok) {
        const data = (await res.json()) as { data: Mensaje }
        setMensajes(prev => [...prev, data.data])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 h-[calc(100dvh-var(--header-height)-4rem)] flex flex-col">
      {/* Card contenedor */}
      <div className="flex flex-col flex-1 rounded-2xl border bg-card shadow-md overflow-hidden">
        
        {/* Header naranja */}
        <div className="shrink-0 px-6 py-4" style={{ backgroundColor: "#E8401A" }}>
          <h1 className="text-lg font-semibold text-white">Mensajes</h1>
          <p className="text-white/70 text-xs mt-0.5">Tu conversación directa con Germán</p>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/20">
          {mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-16">
              <p className="text-muted-foreground text-sm max-w-xs">
                Podés escribirle directamente a Germán. Él responde personalmente.
              </p>
            </div>
          ) : (
            mensajes.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.remitente === "usuario" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.remitente === "usuario"
                      ? "text-white rounded-br-sm"
                      : "bg-white rounded-bl-sm border"
                  }`}
                  style={msg.remitente === "usuario" ? { backgroundColor: "#E8401A" } : {}}
                >
                  {msg.remitente === "german" && (
                    <p className="text-xs font-semibold mb-1 text-muted-foreground">Germán</p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.contenido}</p>
                  <p className={`text-xs mt-1.5 ${
                    msg.remitente === "usuario" ? "text-white/60" : "text-muted-foreground"
                  }`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input fijo abajo */}
        <div className="shrink-0 border-t bg-card px-4 py-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void enviar()
                }
              }}
              placeholder="Escribile a Germán..."
              rows={1}
              className="resize-none max-h-[120px] min-h-[44px] bg-muted/50"
            />
            <Button
              onClick={enviar}
              disabled={enviando || !input.trim()}
              className="shrink-0 text-white size-11 rounded-xl cursor-pointer"
              style={{ backgroundColor: "#E8401A" }}
            >
              {enviando
                ? <Loader2 className="size-4 animate-spin" />
                : <Send className="size-4" />
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
