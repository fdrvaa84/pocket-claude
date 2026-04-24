import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function WelcomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
