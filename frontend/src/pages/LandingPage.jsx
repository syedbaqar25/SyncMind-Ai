import Navbar from '../components/layout/Navbar'
import CTASection from '../components/landing/CTASection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HeroSection from '../components/landing/HeroSection'
import HowItWorks from '../components/landing/HowItWorks'
import TestimonialsSection from '../components/landing/TestimonialsSection'

export default function LandingPage() {
  return (
    <div className="bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
