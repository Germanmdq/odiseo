"use client"

import React from "react"
import { Layout, Palette, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeTab } from "@/components/theme-customizer/theme-tab"
import { LayoutTab } from "@/components/theme-customizer/layout-tab"
import { ImportModal } from "@/components/theme-customizer/import-modal"
import { useThemeManager } from "@/hooks/use-theme-manager"
import { useSidebarConfig } from "@/contexts/sidebar-context"
import { tweakcnThemes } from "@/config/theme-data"
import type { ImportedTheme } from "@/types/theme-customizer"

export default function AparienciaPage() {
  const { applyImportedTheme, isDarkMode, resetTheme, applyRadius, setBrandColorsValues, applyTheme, applyTweakcnTheme } = useThemeManager()
  const { updateConfig: updateSidebarConfig } = useSidebarConfig()

  const [selectedTheme, setSelectedTheme] = React.useState("default")
  const [selectedTweakcnTheme, setSelectedTweakcnTheme] = React.useState("")
  const [selectedRadius, setSelectedRadius] = React.useState("0.5rem")
  const [importedTheme, setImportedTheme] = React.useState<ImportedTheme | null>(null)
  const [importModalOpen, setImportModalOpen] = React.useState(false)

  const handleReset = () => {
    setSelectedTheme("default")
    setSelectedTweakcnTheme("")
    setSelectedRadius("0.5rem")
    setImportedTheme(null)
    setBrandColorsValues({})
    resetTheme()
    applyRadius("0.5rem")
    updateSidebarConfig({ variant: "inset", collapsible: "offcanvas", side: "left" })
  }

  const handleImport = (themeData: ImportedTheme) => {
    setImportedTheme(themeData)
    setSelectedTheme("")
    setSelectedTweakcnTheme("")
    applyImportedTheme(themeData, isDarkMode)
  }

  React.useEffect(() => {
    if (importedTheme) {
      applyImportedTheme(importedTheme, isDarkMode)
    } else if (selectedTheme) {
      applyTheme(selectedTheme, isDarkMode)
    } else if (selectedTweakcnTheme) {
      const preset = tweakcnThemes.find(t => t.value === selectedTweakcnTheme)?.preset
      if (preset) applyTweakcnTheme(preset, isDarkMode)
    }
  }, [isDarkMode, importedTheme, selectedTheme, selectedTweakcnTheme, applyImportedTheme, applyTheme, applyTweakcnTheme])

  return (
    <>
      <div className="space-y-6 px-4 lg:px-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Apariencia</h1>
            <p className="text-muted-foreground">Personalizá tu experiencia. Elegí el tema y el layout que mejor se adapten a vos.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 shrink-0 cursor-pointer">
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </Button>
        </div>

        <Tabs defaultValue="theme">
          <TabsList>
            <TabsTrigger value="theme" className="cursor-pointer">
              <Palette className="h-4 w-4 mr-1.5" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="layout" className="cursor-pointer">
              <Layout className="h-4 w-4 mr-1.5" />
              Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="mt-4">
            <ThemeTab
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              selectedTweakcnTheme={selectedTweakcnTheme}
              setSelectedTweakcnTheme={setSelectedTweakcnTheme}
              selectedRadius={selectedRadius}
              setSelectedRadius={setSelectedRadius}
              setImportedTheme={setImportedTheme}
              onImportClick={() => setImportModalOpen(true)}
            />
          </TabsContent>

          <TabsContent value="layout" className="mt-4">
            <LayoutTab />
          </TabsContent>
        </Tabs>
      </div>

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
      />
    </>
  )
}
