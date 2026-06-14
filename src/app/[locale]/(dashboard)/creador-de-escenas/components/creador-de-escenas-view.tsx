"use client"

import * as React from "react"
import { Send, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { GuardarEnMemoriaButton } from "@/components/guardar-en-memoria-button"
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

  const [messages, setMessages] = React.useState<Message[]>([
    { id: "greeting", role: "assistant", content: t("greeting") },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [retryMessage, setRetryMessage] = React.useState<string | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const scrollEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function updateMessage(messageId: string, updater: (m: Message) => Message) {
    setMessages((current) =>
      current.map((m) => (m.id === messageId ? updater(m) : m))
    )
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
    }
    const assistantMessage: Message = {
      id: `msg-${Date.now()}-assistant`,
      role: "assistant",
      content: "",
    }
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
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok || !response.body) {
        const errorText = await response.text()
        throw new Error(errorText || t("errors.connection"))
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        updateMessage(assistantMessage.id, (m) => ({
          ...m,
          content: `${m.content}${chunk}`,
        }))
      }
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : t("errors.connection")
      setError(message)
      updateMessage(assistantMessage.id, (m) => ({
        ...m,
        content: m.content || t("errors.fallback"),
      }))
    } finally {
      setIsLoading(false)
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

  return (
    <div className="h-full min-h-[600px] max-h-[calc(100vh-200px)] overflow-hidden rounded-lg border bg-background">
      <div className="flex h-full flex-col">
        <header className="flex min-h-16 items-center gap-3 border-b px-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="font-semibold leading-tight">{t("title")}</h1>
            <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="flex-1 px-4">
            <div className="mx-auto max-w-4xl space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-1",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "group max-w-[82%] rounded-lg px-4 py-3 text-sm leading-relaxed break-words",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.content ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <LoadingDots />
                    )}
                  </div>
                  {message.role === "assistant" && message.id !== "greeting" && message.content ? (
                    <GuardarEnMemoriaButton
                      contenido={message.content}
                      origenTipo="narrador"
                      origenMeta={{}}
                      source="Creador de escenas"
                    />
                  ) : null}
                </div>
              ))}

              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
                  <p className="text-destructive">{t("errors.visible")}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      if (retryMessage) void sendMessage(retryMessage)
                    }}
                  >
                    {t("retry")}
                  </Button>
                </div>
              ) : null}

              <div ref={scrollEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="mx-auto flex max-w-4xl items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void sendMessage(input)
                  }
                }}
                placeholder={t("inputPlaceholder")}
                disabled={isLoading}
                rows={1}
                className="max-h-[140px] min-h-10 resize-none"
              />
              <Button
                onClick={() => void sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="shrink-0"
              >
                <Send className="size-4" />
                <span className="sr-only">{t("send")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
