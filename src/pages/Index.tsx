
import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CampaignFeed from '@/components/CampaignFeed';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <HeroSection />
        <CampaignFeed />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
