"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Mensaje {
  id: string
  user_id: string
  remitente: "usuario" | "german"
  contenido: string
  created_at: string
  leido: boolean
}

interface AdminUser {
  id: string
  email?: string
  user_metadata?: Record<string, any>
}

interface AdminMensajesViewProps {
  mensajes: Mensaje[]
  users: AdminUser[]
}

export function AdminMensajesView({ mensajes, users }: AdminMensajesViewProps) {
  const [localMensajes, setLocalMensajes] = useState<Mensaje[]>(mensajes)
  const [activeUserId, setActiveUserId] = useState<string | null>(
    users.length > 0 ? users[0].id : null
  )
  const [input, setInput] = useState("")
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeUser = users.find(u => u.id === activeUserId)
  const activeMensajes = localMensajes.filter(m => m.user_id === activeUserId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeUserId, localMensajes])

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || enviando || !activeUserId) return
    setEnviando(true)
    setInput("")

    try {
      const res = await fetch("/api/mensajes/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId, contenido: texto }),
      })

      if (res.ok) {
        const newMsg: Mensaje = {
          id: Math.random().toString(),
          user_id: activeUserId,
          remitente: "german",
          contenido: texto,
          created_at: new Date().toISOString(),
          leido: false,
        }
        setLocalMensajes(prev => [...prev, newMsg])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-[calc(100dvh-var(--header-height)-2.5rem)] border rounded-xl overflow-hidden bg-card text-card-foreground">
      {/* Columna Izquierda: Conversaciones (Usuarios) */}
      <div className="border-r bg-muted/10 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b shrink-0">
          <h2 className="font-semibold text-base">Conversaciones</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Mensajes recibidos</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {users.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No hay mensajes todavía.
            </div>
          ) : (
            users.map(usr => {
              const userMsgs = localMensajes.filter(m => m.user_id === usr.id)
              const lastMsg = userMsgs[userMsgs.length - 1]
              const isSelected = activeUserId === usr.id

              return (
                <button
                  key={usr.id}
                  type="button"
                  onClick={() => setActiveUserId(usr.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="font-medium text-sm truncate">
                    {usr.user_metadata?.full_name || usr.email || "Usuario sin nombre"}
                  </p>
                  {lastMsg && (
                    <p
                      className={`text-xs truncate mt-1 ${
                        isSelected ? "text-primary-foreground/85" : "text-muted-foreground"
                      }`}
                    >
                      {lastMsg.remitente === "german" ? "Vos: " : ""}
                      {lastMsg.contenido}
                    </p>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Columna Derecha: Ventana de Chat */}
      <div className="flex flex-col h-full overflow-hidden bg-background">
        {activeUser ? (
          <>
            {/* Header del Chat */}
            <div className="p-4 border-b shrink-0 bg-card">
              <h2 className="font-semibold text-sm">
                {activeUser.user_metadata?.full_name || activeUser.email || "Usuario"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{activeUser.email}</p>
            </div>

            {/* Cuerpo de Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeMensajes.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No hay mensajes en esta conversación.
                </div>
              ) : (
                activeMensajes.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.remitente === "german" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.remitente === "german"
                          ? "text-white rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                      style={msg.remitente === "german" ? { backgroundColor: "#E8401A" } : {}}
                    >
                      {msg.remitente === "usuario" && (
                        <p className="text-xs font-semibold mb-1 opacity-60">Usuario</p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.contenido}</p>
                      <p
                        className={`text-xs mt-1.5 ${
                          msg.remitente === "german" ? "text-white/60" : "text-muted-foreground"
                        }`}
                      >
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Responder */}
            <div className="shrink-0 border-t p-4 bg-card">
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
                  placeholder={`Responder a ${activeUser.user_metadata?.full_name || "usuario"}...`}
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/5">
            <p className="text-muted-foreground text-sm font-medium">
              Ninguna conversación seleccionada
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Elegí un usuario del listado lateral para ver su conversación.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
