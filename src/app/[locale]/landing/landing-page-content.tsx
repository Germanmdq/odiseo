"use client"

import React from 'react'
import { LandingNavbar } from './components/navbar'
import { HeroSection } from './components/hero-section'
import { StatsSection } from './components/stats-section'
import { TalleresSection } from './components/talleres-section'
import { AboutSection } from './components/about-section'
import { FeaturesSection } from './components/features-section'
import { BlogSection } from './components/blog-section'
import { FaqSection } from './components/faq-section'
import { CTASection } from './components/cta-section'
import { LandingFooter } from './components/footer'
import { LandingThemeCustomizer, LandingThemeCustomizerTrigger } from './components/landing-theme-customizer'

export function LandingPageContent() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main>
        <HeroSection />
        <TalleresSection />
        <StatsSection />
        <AboutSection />
        <FeaturesSection />
        <BlogSection />
        <FaqSection />
        <CTASection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Theme Customizer */}
      <LandingThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
      <LandingThemeCustomizer open={themeCustomizerOpen} onOpenChange={setThemeCustomizerOpen} />
    </div>
  )
}
