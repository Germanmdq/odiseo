"use client"

import { useState, useEffect } from "react"
import { Menu, MessageSquareText, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GuardarEnMemoriaButton } from "@/components/guardar-en-memoria-button"
import { MessageInput } from "./message-input"
import { AuthorList } from "./author-list"
import { CoachHeader } from "./coach-header"
import { useCoach } from "../use-coach"
import { AUTHORS } from "../data"

export function CoachView() {
  const t = useTranslations("coach")
  const {
    selectedAuthor,
    setSelectedAuthor,
    messages,
    addMessage,
    updateMessage,
  } = useCoach()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loadingAuthor, setLoadingAuthor] = useState<string | null>(null)
  const [errorByAuthor, setErrorByAuthor] = useState<Record<string, string | null>>({})
  const [retryByAuthor, setRetryByAuthor] = useState<Record<string, string | null>>({})
  const [nombrePreferido, setNombrePreferido] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/perfil")
      .then((r) => r.json())
      .then((d: { nombrePreferido?: string }) => {
        setNombrePreferido(d.nombrePreferido ?? "")
      })
      .catch(() => setNombrePreferido(""))
  }, [])

  const currentAuthor = AUTHORS.find((a) => a.id === selectedAuthor) ?? null
  const currentMessages = selectedAuthor ? (messages[selectedAuthor] ?? []) : []
  const isLoading = loadingAuthor === selectedAuthor
  const currentError = errorByAuthor[selectedAuthor]

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

      if (!response.ok || !response.body) {
        const errorText = await response.text()
        throw new Error(errorText || "No pude conectar con el Coach.")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        updateMessage(authorId, assistantMessage.id, (message) => ({
          ...message,
          content: `${message.content}${chunk}`,
        }))
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
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full min-h-[600px] max-h-[calc(100vh-200px)] flex-col gap-3">

        <div className="flex flex-1 overflow-hidden rounded-lg border bg-background">
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Author list sidebar */}
          <div
            className={`
              w-100 flex-shrink-0 border-r bg-background
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              fixed inset-y-0 left-0 z-50
              lg:relative lg:block
              transition-transform duration-300 ease-in-out
            `}
          >
            <div className="lg:hidden p-4 border-b flex items-center justify-between bg-background">
              <h2 className="text-lg font-semibold">{t("conversations")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <AuthorList
              selectedAuthor={selectedAuthor}
              onSelectAuthor={(id) => {
                setSelectedAuthor(id)
                setIsSidebarOpen(false)
              }}
            />
          </div>

          {/* Chat panel */}
          <div className="flex min-w-0 flex-1 flex-col bg-background">
            {/* Header row */}
            <div className="flex h-16 items-center border-b bg-background px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="cursor-pointer lg:hidden mr-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <CoachHeader author={currentAuthor} />
              </div>
            </div>

            {/* Messages area */}
            <div className="flex min-h-0 flex-1 flex-col">
              {selectedAuthor ? (
                <>
                  {currentMessages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                      <MessageSquareText className="size-8 opacity-30" />
                      <p className="text-sm">
                        {currentAuthor
                          ? t("emptyState", { name: currentAuthor.name })
                          : ""}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 px-4">
                      <div className="space-y-3 py-4">
                        {currentMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.senderId === "current-user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div className="group flex w-fit max-w-[80%] items-end gap-1">
                              <div
                                className={`rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap ${
                                  msg.senderId === "current-user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {msg.content ? (
                                  <span>{msg.content}</span>
                                ) : (
                                  <div className="flex items-center gap-1 py-1">
                                    <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full" />
                                    <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full [animation-delay:120ms]" />
                                    <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full [animation-delay:240ms]" />
                                  </div>
                                )}
                              </div>
                              {msg.senderId !== "current-user" && msg.content ? (
                                <GuardarEnMemoriaButton
                                  contenido={msg.content}
                                  origenTipo="coach"
                                  origenMeta={{ autorId: selectedAuthor ?? "" }}
                                  source={`Coach — ${currentAuthor?.name ?? selectedAuthor ?? ""}`}
                                />
                              ) : null}
                            </div>
                          </div>
                        ))}
                        {currentError ? (
                          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
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
                      </div>
                    </ScrollArea>
                  )}

                  <MessageInput
                    onSendMessage={(message) => void handleSendMessage(message)}
                    disabled={isLoading}
                    placeholder={
                      currentAuthor
                        ? t("inputPlaceholder", { name: currentAuthor.name })
                        : t("inputPlaceholderDefault")
                    }
                  />
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
