"use client"

import { useState, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Escribí un mensaje...",
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed || disabled) return
    onSendMessage(trimmed)
    setMessage("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="flex shrink-0 items-end gap-2 border-t border-[#EEEEEE] bg-white px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:pb-4 sm:rounded-b-[1.6rem]">
      <Textarea
        ref={textareaRef}
        suppressHydrationWarning
        placeholder={disabled ? "Esperando respuesta..." : placeholder}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
        className={cn(
          "min-h-[42px] max-h-[110px] flex-1 resize-none rounded-2xl border-[#D9D9D9] bg-white text-[16px] leading-[1.35] text-black placeholder:text-black/30 focus:border-[#FF2B0A]/40 sm:text-sm",
          disabled && "opacity-60"
        )}
      />
      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="shrink-0 cursor-pointer rounded-2xl bg-[#FF2B0A] text-white hover:bg-[#e02500] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
