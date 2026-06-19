"use client"

import { useSyncExternalStore } from "react"

function subscribeToFullscreen(callback: () => void) {
  document.addEventListener("fullscreenchange", callback)

  return () => {
    document.removeEventListener("fullscreenchange", callback)
  }
}

function getFullscreenSnapshot() {
  return !!document.fullscreenElement
}

function getServerFullscreenSnapshot() {
  return false
}

export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreen,
    getFullscreenSnapshot,
    getServerFullscreenSnapshot
  )

  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error)
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}
