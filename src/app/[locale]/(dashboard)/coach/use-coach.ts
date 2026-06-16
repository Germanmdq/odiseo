"use client"

import { create } from "zustand"

export interface CoachMessage {
  id: string
  content: string
  timestamp: string
  senderId: "current-user" | string
}

interface CoachState {
  selectedAuthor: string
  messages: Record<string, CoachMessage[]>
  searchQuery: string
}

interface CoachActions {
  setSelectedAuthor: (id: string) => void
  addMessage: (authorId: string, message: CoachMessage) => void
  updateMessage: (
    authorId: string,
    messageId: string,
    updater: (message: CoachMessage) => CoachMessage
  ) => void
  setSearchQuery: (query: string) => void
}

export const useCoach = create<CoachState & CoachActions>((set) => ({
  selectedAuthor: "asistente",
  messages: {},
  searchQuery: "",
  setSelectedAuthor: (id) => set({ selectedAuthor: id }),
  addMessage: (authorId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [authorId]: [...(state.messages[authorId] ?? []), message],
      },
    })),
  updateMessage: (authorId, messageId, updater) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [authorId]: (state.messages[authorId] ?? []).map((message) =>
          message.id === messageId ? updater(message) : message
        ),
      },
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
