
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Heart, Shield, Clock, Zap, BarChart4, BadgeDollarSign } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-blue-50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">About RapidFund</h1>
              <p className="text-xl text-gray-700 mb-8">
                We're building a faster, more transparent way to help those in urgent need.
              </p>
              <div className="flex justify-center">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <Heart className="h-10 w-10 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                RapidFund was born from a simple observation: when people need help most urgently, traditional fundraising platforms are often too slow, too expensive, or too complicated.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                We believe that in times of crisis, help shouldn't be delayed by paperwork, high fees, or complex processes. Our mission is to connect those in need with those who can help—instantly and transparently.
              </p>
              <p className="text-lg text-gray-700">
                By leveraging modern technology and focusing on speed and simplicity, we're creating a platform where help arrives in seconds, not days. Whether it's a medical emergency, a natural disaster, or any other urgent situation, RapidFund makes it possible to receive support when it matters most.
              </p>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">What Makes Us Different</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                <p className="text-gray-600">
                  Create a campaign in minutes and receive funds within hours, not weeks. Our streamlined process eliminates unnecessary delays.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-green-100 p-3 rounded-full w-fit mb-4">
                  <BadgeDollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Zero Platform Fees</h3>
                <p className="text-gray-600">
                  We don't take a cut from your donations. 100% of what you give goes directly to those in need (payment processor fees still apply).
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-purple-100 p-3 rounded-full w-fit mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verification System</h3>
                <p className="text-gray-600">
                  Our community-based verification process helps ensure authenticity while maintaining speed.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-orange-100 p-3 rounded-full w-fit mb-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Updates</h3>
                <p className="text-gray-600">
                  See donations as they happen and track how funds are being used with our transparent reporting.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-red-100 p-3 rounded-full w-fit mb-4">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Focused on Urgent Needs</h3>
                <p className="text-gray-600">
                  We specialize in emergency situations like medical bills, natural disasters, and eviction prevention.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-teal-100 p-3 rounded-full w-fit mb-4">
                  <BarChart4 className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Impact Tracking</h3>
                <p className="text-gray-600">
                  See exactly how your donations have helped and the difference you've made in people's lives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team / Founder's Message */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">A Message from Our Founder</h2>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row items-center mb-6">
                  <img 
                    src="https://randomuser.me/api/portraits/women/76.jpg" 
                    alt="Founder" 
                    className="w-24 h-24 rounded-full mb-4 md:mb-0 md:mr-6"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">Sarah Johnson</h3>
                    <p className="text-gray-600">Founder & CEO</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  "I started RapidFund after watching a friend struggle to get financial help for an emergency medical procedure. Despite dozens of people wanting to help, traditional platforms took too long and charged too much. By the time the money was available, it was almost too late.
                  <br /><br />
                  That experience showed me that in times of crisis, speed matters. Our platform exists to ensure that when help is needed most urgently, it can be mobilized immediately. We're committed to building technology that serves humanity at its most vulnerable moments."
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of others who are changing lives through immediate, direct support.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/#campaigns" 
                className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition duration-300"
              >
                Donate Now
              </a>
              <a 
                href="/create-campaign" 
                className="bg-blue-700 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-800 transition duration-300"
              >
                Start a Campaign
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
