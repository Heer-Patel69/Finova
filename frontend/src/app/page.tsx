'use client';

import React, { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import ProblemSection from '../components/landing/ProblemSection';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import FAQSection from '../components/landing/FAQSection';
import FooterSection from '../components/landing/FooterSection';

export default function LandingPage() {
  // Force dark theme on landing page for the premium SaaS look
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1123] text-white overflow-x-hidden selection:bg-indigo-500/30 font-body">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofSection />
        <ProblemSection />
        <FeatureShowcase />
        <HowItWorksSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  );
}
