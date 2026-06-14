import type { Metadata } from 'next'
import { LandingPageContent } from './landing-page-content'

export const metadata: Metadata = {
  title: 'Odiseo — Tu compañero de imaginación',
  description: 'Un espacio para estudiar, practicar y aplicar la ley de imaginación según Neville Goddard. Con Coach IA, Narrador, Biblia metafísica, testimonios y más.',
  keywords: ['neville goddard', 'ley de imaginación', 'coach IA', 'práctica espiritual', 'biblia metafísica'],
  openGraph: {
    title: 'Odiseo — Tu compañero de imaginación',
    description: 'Un espacio para estudiar, practicar y aplicar la ley de imaginación según Neville Goddard.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Odiseo — Tu compañero de imaginación',
    description: 'Un espacio para estudiar, practicar y aplicar la ley de imaginación según Neville Goddard.',
  },
}

export default function LandingPage() {
  return <LandingPageContent />
}
