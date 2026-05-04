import { TopAppBar } from "../components/TopAppBar";
import { HeroSection } from "../components/HeroSection";
import { FeaturesGrid } from "../components/FeaturesGrid";
import { HowItWorks } from "../components/HowItWorks";
import { Footer } from "../components/Footer";

export function LandingPage() {
  return (
    <>
      <TopAppBar />
      <main className="pt-24">
        <HeroSection />
        <FeaturesGrid />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
