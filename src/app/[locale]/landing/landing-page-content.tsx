import { HeroOdiseo } from '@/components/landing/hero-odiseo'
import { OdiseoOrbital } from '@/components/landing/odiseo-orbital'
import { StatsSection } from './components/stats-section'
import { TalleresSection } from './components/talleres-section'
import { AboutSection } from './components/about-section'
import { FeaturesSection } from './components/features-section'
import { BlogSection } from './components/blog-section'
import { FaqSection } from './components/faq-section'
import { CTASection } from './components/cta-section'
import { LandingFooter } from './components/footer'

export function LandingPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroOdiseo />
        <OdiseoOrbital />
        <TalleresSection />
        <StatsSection />
        <AboutSection />
        <FeaturesSection />
        <BlogSection />
        <FaqSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
