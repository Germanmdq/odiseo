"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CrearLibroDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (titulo: string) => Promise<void>
}

export function CrearLibroDialog({ open, onOpenChange, onCreate }: CrearLibroDialogProps) {
  const [titulo, setTitulo] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || loading) return
    setLoading(true)
    try {
      await onCreate(titulo.trim())
      setTitulo("")
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Crear nuevo libro</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título del libro"
              disabled={loading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!titulo.trim() || loading} style={{ backgroundColor: "#E8401A", color: "#fff" }}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
