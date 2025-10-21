import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/pages/Pricing";
import Testimonials from "@/components/Testimonials";
import TrustBanner from "@/components/TrustBanner";
import Footer from "@/components/Footer";
import { MembershipComparison } from "@/components/membership/MembershipComparison";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <MembershipComparison />
      <Testimonials />
      <Pricing />
      <TrustBanner />
      <Footer />
    </div>
  );
};

export default Index;
