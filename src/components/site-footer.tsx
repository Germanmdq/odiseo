export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="px-4 py-4 lg:px-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Odiseo — Universidad de la Imaginación
        </p>
      </div>
    </footer>
  )
}
