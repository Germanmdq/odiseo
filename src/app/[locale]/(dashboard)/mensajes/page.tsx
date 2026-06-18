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
    <div className="flex flex-col h-[calc(100dvh-var(--header-height)-2rem)] max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="py-6 border-b shrink-0">
        <h1 className="text-xl font-semibold">Mensajes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tu conversación directa con Germán
        </p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
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
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.remitente === "usuario"
                  ? "text-white rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
              style={msg.remitente === "usuario" ? { backgroundColor: "#E8401A" } : {}}
              >
                {msg.remitente === "german" && (
                  <p className="text-xs font-semibold mb-1 opacity-60">Germán</p>
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

      {/* Input */}
      <div className="shrink-0 border-t py-4">
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
            className="resize-none max-h-[120px] min-h-[44px]"
          />
          <Button
            onClick={enviar}
            disabled={enviando || !input.trim()}
            className="shrink-0 text-white size-11 cursor-pointer"
            style={{ backgroundColor: "#E8401A" }}
          >
            {enviando
              ? <Loader2 className="size-4 animate-spin" />
              : <Send className="size-4" />
            }
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}
