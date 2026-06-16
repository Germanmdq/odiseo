"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Playfair_Display } from "next/font/google"
import { Menu, X } from "lucide-react"

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic"] })

const NAV_LINKS = [
  { label: "Blog", href: "blog" },
  { label: "FAQs", href: "#faq" },
]

export function HeroOdiseo() {
  const params = useParams()
  const locale = (params.locale as string) ?? "es"
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-badge { animation: fadeInUp 0.8s ease forwards; animation-delay: 0.3s; opacity: 0; }
        .hero-h1    { animation: fadeInUp 0.8s ease forwards; animation-delay: 0.8s; opacity: 0; }
        .hero-p     { animation: fadeInUp 0.8s ease forwards; animation-delay: 1.3s; opacity: 0; }
        .hero-cta   { animation: fadeInUp 0.8s ease forwards; animation-delay: 1.8s; opacity: 0; }
      `}</style>

      <section className="flex items-center justify-center p-4 md:p-8 bg-background w-full">
        <div className="relative w-full max-w-[1400px] aspect-[4/3] md:aspect-[16/9] min-h-[600px] md:min-h-[800px] rounded-[2rem] overflow-hidden shadow-2xl bg-black mx-auto">

          {/* Video de fondo */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          >
            <source
              src="https://cdn.sceneai.art/Hero%20Section%20Video/e988037c-bf57-4b3b-8ba9-b69167028de8.mp4"
              type="video/mp4"
            />
          </video>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Navegación */}
          <nav className="absolute top-0 left-0 w-full px-6 md:px-10 py-6 flex justify-between items-center z-30">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <Image
                src="/logo-odiseo.png"
                alt="Odiseo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-white font-bold tracking-wide text-lg">Odiseo</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-white/90 hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={`/${locale}/${link.href}`}
                    className="text-white/90 hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                href={`/${locale}/login`}
                className="border-2 border-white bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#FF2B0A] hover:border-[#FF2B0A] hover:text-white transition-colors"
              >
                Comenzar gratis
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="w-12 h-12 flex items-center justify-center text-white"
                aria-label="Menú"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div
                className="absolute right-0 top-14 w-48 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 p-2 flex flex-col gap-1 transition-all duration-200"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "scale(1)" : "scale(0.95)",
                  pointerEvents: menuOpen ? "auto" : "none",
                  transformOrigin: "top right",
                }}
              >
                {NAV_LINKS.map((link) =>
                  link.href.startsWith("#") ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-white/90 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={`/${locale}/${link.href}`}
                      onClick={() => setMenuOpen(false)}
                      className="text-white/90 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <div className="border-t border-white/10 mt-1 pt-1">
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMenuOpen(false)}
                    className="block text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Comenzar gratis
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Contenido hero */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-28 text-center px-4 z-20">
            {/* Badge */}
            <div className="hero-badge mb-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-4 py-1.5 rounded-full tracking-wider">
                Universidad de la Imaginación
              </span>
            </div>

            {/* H1 */}
            <h1
              className="hero-h1 text-white leading-tight"
              style={{ fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 600 }}
            >
              La imaginación es
              <br />
              el poder más real
              <br />
              <span className={playfair.className}>que tenés.</span>
            </h1>

            {/* Subtítulo */}
            <p className="hero-p text-white/80 text-lg md:text-xl mt-4 max-w-xl">
              Asistente integral para controlar tu imaginación.
            </p>

            {/* CTA */}
            <div className="hero-cta mt-8">
              <Link
                href={`/${locale}/registro`}
                className="inline-block border-2 border-white bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-[#FF2B0A] hover:border-[#FF2B0A] hover:text-white transition-colors"
              >
                Empezar ahora — es gratis
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
