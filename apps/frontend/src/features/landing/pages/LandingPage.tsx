import { Navbar } from "../components/navbar";
import { Hero } from "../components/hero";
import { Features } from "../components/features";
import { HowItWorks } from "../components/how-it-works";
import { SocialProof } from "../components/social-proof";
import { Footer } from "../components/footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
}
