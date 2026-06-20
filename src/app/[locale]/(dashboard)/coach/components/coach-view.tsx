"use client"

import { useState, useEffect, useMemo, useRef } from "react"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import Link from "next/link"
import ReactMarkdown, { type Components } from "react-markdown"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { CompartirEn } from "@/components/compartir-en"
import { GuardarEnMemoriaButton } from "@/components/guardar-en-memoria-button"
import { Paywall } from "@/components/paywall"
import { SugerenciasCoach, getSugerencias, extraerTema } from "@/components/sugerencias-coach"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { MessageInput } from "./message-input"
import { CoachHeader } from "./coach-header"
import { useCoach } from "../use-coach"
import { AUTHORS } from "../data"

// ─── Saludo inicial ──────────────────────────────────────────────────────────

function getInitialGreeting(nombre: string): string {
  const greeting = nombre ? `Hola, ${nombre}.` : "Hola."
  return `${greeting} Soy tu Asistente de imaginación.\n\n¿De qué querés hablar hoy?`
}

// ─── ReactMarkdown renderers ─────────────────────────────────────────────────

const aiComponents: Components = {
  a: ({ href, children }) => (
    <Link
      href={href ?? "#"}
      className="font-semibold text-[#FF2B0A] underline underline-offset-2 break-words"
    >
      {children}
    </Link>
  ),
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-[1.45]">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-black">
      {children}
    </strong>
  ),
}

// ─── Tipos ──────────────────────────────────────────────────────────────────

type DisplayMessage = {
  id: string
  content: string
  timestamp: string
  senderId: string
  isInitial?: boolean
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function CoachView() {
  const t = useTranslations("coach")
  const params = useParams()
  const locale = (params?.locale as string) ?? "es"

  const {
    selectedAuthor,
    messages,
    addMessage,
    updateMessage,
  } = useCoach()

  const [loadingAuthor, setLoadingAuthor] = useState<string | null>(null)
  const [paywallBlocked, setPaywallBlocked] = useState(false)
  const [errorByAuthor, setErrorByAuthor] = useState<Record<string, string | null>>({})
  const [retryByAuthor, setRetryByAuthor] = useState<Record<string, string | null>>({})
  const [mostrarSugerencias, setMostrarSugerencias] = useState<Record<string, boolean>>({})
  const [ultimoMensaje, setUltimoMensaje] = useState<Record<string, string>>({})
  const [ultimoTema, setUltimoTema] = useState<string>("")
  const [nombrePreferido, setNombrePreferido] = useState<string | null>(null)
  const scrollBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/perfil", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { nombrePreferido?: string }) => {
        setNombrePreferido(d.nombrePreferido ?? "")
      })
      .catch(() => setNombrePreferido(""))
  }, [])

  // Leer contexto compartido desde otra herramienta
  useEffect(() => {
    const raw = sessionStorage.getItem("odiseo_reutilizar")
    if (!raw) return
    // Limpiar siempre, incluso si el parseo falla, para no reinyectar en visitas futuras.
    sessionStorage.removeItem("odiseo_reutilizar")

    let parsed: { content?: string; origen?: string; titulo?: string }
    try {
      parsed = JSON.parse(raw)
    } catch (e) {
      console.error("[coach] odiseo_reutilizar no es JSON válido:", raw, e)
      return
    }

    const content = (parsed.content ?? "").trim()
    const origen = parsed.origen ?? "desconocido"

    if (!content) {
      console.error("[coach] contenido compartido vacío o sin campo 'content'. Objeto recibido:", parsed)
      return
    }

    // No reinyectar contenido generado por el propio Coach: evita el loop de
    // auto-alimentación (compartir una conversación de Coach de vuelta a Coach).
    if (origen === "coach") {
      return
    }

    // El Coach es un único asistente; ignoramos el ?autor= legacy.
    setTimeout(() => {
      void handleSendMessage(
        `Quiero seguir profundizando en esto:\n\n${content}`,
        true
      )
    }, 300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentAuthor = AUTHORS.find((a) => a.id === selectedAuthor) ?? null
  const currentMessages = useMemo(
    () => (selectedAuthor ? (messages[selectedAuthor] ?? []) : []),
    [messages, selectedAuthor]
  )
  const isLoading = loadingAuthor === selectedAuthor
  const currentError = errorByAuthor[selectedAuthor]

  // Mensaje inicial hardcodeado — solo se muestra una vez cargado el perfil
  const initialGreeting: DisplayMessage | null = useMemo(() => {
    if (!selectedAuthor || nombrePreferido === null) return null

    return {
      id: `initial-${selectedAuthor}`,
      content: getInitialGreeting(nombrePreferido),
      timestamp: "",
      senderId: selectedAuthor,
      isInitial: true,
    }
  }, [nombrePreferido, selectedAuthor])

  const displayMessages: DisplayMessage[] = useMemo(
    () =>
      initialGreeting
        ? [initialGreeting, ...(currentMessages as DisplayMessage[])]
        : (currentMessages as DisplayMessage[]),
    [currentMessages, initialGreeting]
  )

  // Auto-scroll al fondo con cada nuevo mensaje
  useEffect(() => {
    const container = scrollBottomRef.current?.parentElement?.parentElement
    if (container) container.scrollTop = container.scrollHeight
  }, [displayMessages])

  const handleSendMessage = async (content: string, appendUser = true) => {
    if (!selectedAuthor) return

    const authorId = selectedAuthor
    const userMessage = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      senderId: "current-user" as const,
    }
    const assistantMessage = {
      id: `msg-${Date.now()}-assistant`,
      content: "",
      timestamp: new Date().toISOString(),
      senderId: authorId,
    }
    const requestMessages = [
      ...(messages[authorId] ?? []),
      userMessage,
    ].map((message) => ({
      role: message.senderId === "current-user" ? "user" : "assistant",
      content: message.content,
    }))

    if (appendUser) addMessage(authorId, userMessage)
    addMessage(authorId, assistantMessage)
    setLoadingAuthor(authorId)
    setErrorByAuthor((current) => ({ ...current, [authorId]: null }))
    setRetryByAuthor((current) => ({ ...current, [authorId]: content }))
    setMostrarSugerencias((current) => ({ ...current, [authorId]: false }))
    setUltimoMensaje((current) => ({ ...current, [authorId]: content }))

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autorId: authorId,
          messages: requestMessages,
          nombrePreferido: nombrePreferido ?? "",
        }),
      })

      if (response.status === 403) {
        setPaywallBlocked(true)
        return
      }

      if (!response.ok || !response.body) {
        const errorText = await response.text()
        throw new Error(errorText || "No pude conectar con el Coach.")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk
        updateMessage(authorId, assistantMessage.id, (message) => ({
          ...message,
          content: `${message.content}${chunk}`,
        }))
      }

      if (accumulatedContent && accumulatedContent.length > 50) {
        fetch("/api/memoria", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contenido: accumulatedContent,
            origenTipo: "coach",
            origenMeta: { autorId: authorId, preguntaUsuario: content },
            source: `Coach — ${currentAuthor?.name ?? authorId}`,
          }),
        }).catch(() => {})
      }

    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No pude responder ahora."
      setErrorByAuthor((current) => ({
        ...current,
        [authorId]: message,
      }))
      updateMessage(authorId, assistantMessage.id, (current) => ({
        ...current,
        content:
          current.content ||
          "No pude responder ahora. Revisá la conexión y probá de nuevo.",
      }))
    } finally {
      setLoadingAuthor((current) => (current === authorId ? null : current))

      // Después del stream, en el finally:
      const mensajesUsuario = (messages[authorId] ?? [])
        .filter(m => m.senderId === "current-user")

      const ultimoMensajeUsuario = mensajesUsuario[mensajesUsuario.length - 1]?.content ?? ""

      // Extraer máximo 3 palabras clave, sin signos de puntuación
      const tema = ultimoMensajeUsuario
        .replace(/[¿?¡!.,]/g, "")
        .split(" ")
        .filter(w => w.length > 3) // ignorar palabras cortas
        .slice(0, 3)
        .join(" ")
        .toLowerCase()
        .trim()

      setUltimoTema(tema)
      setMostrarSugerencias(prev => ({ ...prev, [authorId]: true }))
    }
  }

  // El tema es el último mensaje que escribió el usuario
  const ultimoMensajeUsuario = currentMessages
    .filter(m => m.senderId === "current-user")
    .slice(-1)[0]?.content ?? ""

  function getShareableConversation(messageIndex: number) {
    const assistantMessage = currentMessages[messageIndex]
    const previousUserMessage = currentMessages
      .slice(0, messageIndex)
      .reverse()
      .find((message) => message.senderId === "current-user")

    if (!previousUserMessage?.content) return assistantMessage.content

    return `Venía conversando sobre esto:\n${previousUserMessage.content}\n\nY el Asistente me dijo:\n${assistantMessage.content}`
  }

  return (
    <TooltipProvider delayDuration={0}>
    <div className="flex h-full min-h-0 overflow-hidden sm:pb-6">
      <div className="relative flex w-full flex-1 overflow-hidden bg-white sm:rounded-[1.6rem] sm:shadow-[0_20px_60px_rgba(0,0,0,0.18),0_8px_20px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_100%,rgba(255,43,10,0.04),transparent_40%)]" />
          {/* Mobile overlay */}
          {/* Chat panel */}
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
            {/* Header row */}
            <div className="flex h-14 shrink-0 items-center border-b border-[#EEEEEE] bg-white px-3 sm:h-16 sm:px-4">
              <SidebarTrigger className="mr-2 md:hidden" />
              <div className="flex-1 min-w-0">
                <CoachHeader author={currentAuthor} />
              </div>
            </div>

            {/* Messages area */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {paywallBlocked ? (
                <div className="flex flex-1 items-center justify-center p-4">
                  <Paywall locale={locale} />
                </div>
              ) : selectedAuthor ? (
                <>
                  {displayMessages.length === 0 ? (
                    // Breve estado de carga mientras se fetchea el perfil
                    <div className="flex flex-1 items-center justify-center">
                      <div className="flex items-center gap-1">
                        <span className="bg-muted-foreground/40 size-1.5 animate-bounce rounded-full" />
                        <span className="bg-muted-foreground/40 size-1.5 animate-bounce rounded-full [animation-delay:120ms]" />
                        <span className="bg-muted-foreground/40 size-1.5 animate-bounce rounded-full [animation-delay:240ms]" />
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-4">
                      <div className="w-full space-y-3 py-3 sm:space-y-4 sm:py-4">
                        {displayMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col w-full mb-2 ${
                              msg.senderId === "current-user" ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`group relative flex min-w-0 items-end gap-2 ${
                                msg.senderId === "current-user"
                                  ? "max-w-[92%] flex-row-reverse sm:max-w-[85%]"
                                  : "w-full max-w-full flex-row sm:max-w-[85%]"
                              }`}
                            >
                              <div
                                className={`min-w-0 max-w-full rounded-2xl px-3.5 py-2.5 text-[15px] leading-[1.45] break-words shadow-sm [overflow-wrap:anywhere] sm:px-4 sm:py-3 ${
                                  msg.senderId === "current-user"
                                    ? "w-fit bg-black text-white rounded-br-sm"
                                    : "w-full border border-[#EEEEEE] bg-[#F4F4F4] text-black prose prose-sm prose-p:my-0 max-w-none rounded-bl-sm"
                                }`}
                              >
                                {msg.content ? (
                                  msg.senderId === "current-user" ? (
                                    <span className="whitespace-pre-wrap">{msg.content}</span>
                                  ) : (
                                    <ReactMarkdown components={aiComponents}>
                                      {msg.content}
                                    </ReactMarkdown>
                                  )
                                ) : (
                                  <div className="flex items-center gap-1 py-1">
                                    <span className="bg-black/30 size-1.5 animate-bounce rounded-full" />
                                    <span className="bg-black/30 size-1.5 animate-bounce rounded-full [animation-delay:120ms]" />
                                    <span className="bg-black/30 size-1.5 animate-bounce rounded-full [animation-delay:240ms]" />
                                  </div>
                                )}
                              </div>
                              {/* CompartirEn */}
                              {msg.senderId !== "current-user" && msg.content && !msg.isInitial ? (
                                <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mb-1 items-center gap-1">
                                  <CompartirEn
                                    contenido={getShareableConversation(currentMessages.indexOf(msg))}
                                    origen="coach"
                                    size="xs"
                                    variante="coach"
                                    label="Usar esta conversación"
                                  />
                                  <GuardarEnMemoriaButton
                                    contenido={msg.content}
                                    origenTipo="coach"
                                    origenMeta={{ 
                                      autorId: selectedAuthor ?? "",
                                      preguntaUsuario: currentMessages[currentMessages.indexOf(msg) - 1]?.content ?? ""
                                    }}
                                    source={`Coach — ${currentAuthor?.name ?? ""}`}
                                    className="!opacity-100"
                                  />
                                </div>
                              ) : null}
                            </div>

                            {/* Chip de perfil: solo en el mensaje inicial cuando no hay nombre */}
                            {msg.isInitial && !nombrePreferido && (
                              <Link
                                href={`/${locale}/configuracion/perfil`}
                                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                              >
                                → Completá tu nombre en Perfil
                              </Link>
                            )}
                          </div>
                        ))}
                        {mostrarSugerencias[selectedAuthor ?? ""] && !isLoading ? (
                          <div className="w-full min-w-0 overflow-hidden">
                            <SugerenciasCoach
                              sugerencias={getSugerencias(ultimoMensajeUsuario)}
                              tema={ultimoTema}
                            />
                          </div>
                        ) : null}
                        {currentError ? (
                          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
                            <p className="text-destructive">
                              No pude completar la respuesta. Probá de nuevo en un momento.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                const retry = retryByAuthor[selectedAuthor]
                                if (retry) void handleSendMessage(retry, false)
                              }}
                            >
                              Reintentar
                            </Button>
                          </div>
                        ) : null}
                        <div ref={scrollBottomRef} />
                      </div>
                    </div>
                  )}

                  <div className="shrink-0 border-t border-[#EEEEEE] bg-white">
                    <MessageInput
                      onSendMessage={(message) => void handleSendMessage(message)}
                      disabled={isLoading}
                      placeholder={
                        currentAuthor
                          ? t("inputPlaceholder", { name: currentAuthor.name })
                          : t("inputPlaceholderDefault")
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold">{t("selectTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("selectSubtitle")}</p>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  )
}
