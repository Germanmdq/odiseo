import { PreciosOdiseo } from "@/components/precios-odiseo"
import { FeaturesGrid } from "./components/features-grid"
import { FAQSection } from "./components/faq-section"

import featuresData from "./data/features.json"
import faqsData from "./data/faqs.json"

export default function PricingPage() {
  return (
    <div className="px-4 lg:px-6 space-y-12">
      <section>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Planes Odiseo</h1>
          <p className="text-muted-foreground">
            Elegí el plan que mejor se adapta a vos. Cancelás cuando querés.
          </p>
        </div>
        <PreciosOdiseo />
      </section>

      <FeaturesGrid features={featuresData} />

      <FAQSection faqs={faqsData} />
    </div>
  )
}
