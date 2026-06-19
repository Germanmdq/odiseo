"use client"

import * as React from "react"
import { Send, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import ReactMarkdown from "react-markdown"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CompartirEn } from "@/components/compartir-en"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full" />
      <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full [animation-delay:120ms]" />
      <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full [animation-delay:240ms]" />
    </div>
  )
}


export function CreadorDeEscenasView() {
  const t = useTranslations("creador")
  const params = useParams()
  const locale = (params?.locale as string) ?? "es"

  const [messages, setMessages] = React.useState<Message[]>([
    { id: "greeting", role: "assistant", content: t("greeting") },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [retryMessage, setRetryMessage] = React.useState<string | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // Pre-cargar contenido recibido de otra herramienta
  React.useEffect(() => {
    const raw = sessionStorage.getItem("odiseo_reutilizar")
    if (!raw) return
    try {
      const { content } = JSON.parse(raw) as { content: string }
      sessionStorage.removeItem("odiseo_reutilizar")
      setInput(content)
    } catch {}
  }, [])

  // Scroll al fondo del contenedor interno, no de la página
  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  function updateMessage(messageId: string, updater: (m: Message) => Message) {
    setMessages((current) =>
      current.map((m) => (m.id === messageId ? updater(m) : m))
    )
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { id: `msg-${Date.now()}`, role: "user", content: trimmed }
    const assistantMessage: Message = { id: `msg-${Date.now()}-assistant`, role: "assistant", content: "" }
    const nextMessages = [...messages, userMessage]

    setMessages((current) => [...current, userMessage, assistantMessage])
    setIsLoading(true)
    setError(null)
    setRetryMessage(trimmed)
    setInput("")

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      const response = await fetch("/api/creador-de-escenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (response.status === 403) {
        window.location.href = `/${locale}/pricing`
        return
      }

      if (!response.ok || !response.body) {
        throw new Error((await response.text()) || t("errors.connection"))
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk
        updateMessage(assistantMessage.id, (m) => ({ ...m, content: `${m.content}${chunk}` }))
      }

      if (accumulatedContent && accumulatedContent.length > 50) {
        fetch("/api/memoria", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contenido: accumulatedContent,
            origenTipo: "creador",
            origenMeta: { preguntaUsuario: content },
            source: "Creador de escenas",
          }),
        }).catch(() => {})
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t("errors.connection")
      setError(message)
      updateMessage(assistantMessage.id, (m) => ({
        ...m,
        content: m.content || t("errors.fallback"),
      }))
    } finally {
      setIsLoading(false)
      // Re-focus textarea después de respuesta
      textareaRef.current?.focus()
    }
  }

  function handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value
    setInput(value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`
    }
  }

  function getShareableScene(messageIndex: number) {
    const assistantMessage = messages[messageIndex]
    const previousUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((message) => message.role === "user")

    if (!previousUserMessage?.content) return assistantMessage.content

    return `Pedido del usuario:\n${previousUserMessage.content}\n\nEscena creada:\n${assistantMessage.content}`
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-none bg-white shadow-none pb-0 sm:rounded-[1.6rem] sm:shadow-[0_20px_60px_rgba(0,0,0,0.18),0_8px_20px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)] sm:pb-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_100%,rgba(255,43,10,0.04),transparent_40%)]" />
      {/* Header fijo */}
      <header className="relative flex shrink-0 h-14 items-center gap-3 border-b border-[#EEEEEE] bg-white px-3 sm:h-16 sm:px-4">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-white border border-[#EEEEEE] text-[#FF2B0A] sm:size-10">
          <Sparkles className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-black sm:text-lg">{t("title")}</h1>
          <p className="truncate text-xs text-black/40 sm:text-sm">{t("subtitle")}</p>
        </div>
      </header>

      {/* Mensajes — scroll interno */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 min-h-0 overflow-y-auto px-3 sm:px-4"
      >
        <div className="mx-auto max-w-3xl space-y-3 py-3 sm:space-y-4 sm:py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col w-full mb-2",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div className={cn("group relative flex items-end gap-2 max-w-[92%] sm:max-w-[85%]", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div
                  className={cn(
                    "max-w-full rounded-2xl px-3 py-2.5 text-[14px] leading-relaxed break-words shadow-sm sm:px-4 sm:py-3 sm:text-[15px]",
                    message.role === "user"
                      ? "bg-black text-white rounded-br-sm"
                      : "border border-[#EEEEEE] bg-[#F4F4F4] text-black prose prose-sm max-w-none rounded-bl-sm"
                  )}
                >
                  {message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    )
                  ) : (
                    <LoadingDots />
                  )}
                </div>

                {message.role === "assistant" && message.id !== "greeting" && message.content && !isLoading ? (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mb-1">
                    <CompartirEn
                      contenido={getShareableScene(messages.indexOf(message))}
                      origen="creador"
                      size="xs"
                      label="Usar esta escena"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <p className="text-destructive">{t("errors.visible")}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => { if (retryMessage) void sendMessage(retryMessage) }}
              >
                {t("retry")}
              </Button>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input fijo abajo */}
      <div className="relative shrink-0 border-t border-[#EEEEEE] bg-white px-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            ref={textareaRef}
            suppressHydrationWarning
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !isLoading) {
                event.preventDefault()
                void sendMessage(input)
              }
            }}
            placeholder={t("inputPlaceholder")}
            rows={1}
            className={cn("max-h-[140px] min-h-[42px] flex-1 resize-none rounded-2xl border-[#D9D9D9] bg-white text-[16px] text-black placeholder:text-black/30 sm:text-sm", isLoading && "opacity-60")}
          />
          <Button
            onClick={() => void sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="shrink-0 rounded-2xl bg-[#FF2B0A] text-white hover:bg-[#e02500] disabled:opacity-40"
          >
            <Send className="size-4" />
            <span className="sr-only">{t("send")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
