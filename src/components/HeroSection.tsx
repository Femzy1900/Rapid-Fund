
import React from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
              Real-time Relief Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Send Help in <span className="text-blue-500">Seconds</span>, <br className="hidden md:block" />
              Not Days
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
              Our platform eliminates traditional hurdles, connecting people in need with those who can help—instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-lg px-8">
                Donate Now
              </Button>
              <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 text-lg">
                Start a Campaign
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">JD</div>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">KL</div>
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">MR</div>
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">+5</div>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">2,845 people</span> donated in the last 24 hours
              </p>
            </div>
          </div>
          
          <div className="flex-1 mt-8 md:mt-0 relative">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Quick Donation</h3>
                <p className="text-gray-500 text-sm">100% of your donation goes directly to people in need</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="font-medium text-sm">Select Amount</p>
                    <button className="text-sm text-blue-500">Custom</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 rounded-md py-3 font-semibold transition-colors">$25</button>
                    <button className="border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-md py-3 font-semibold">$50</button>
                    <button className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 rounded-md py-3 font-semibold transition-colors">$100</button>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-sm block mb-2">Payment Method</label>
                  <div className="flex gap-2">
                    <button className="flex-1 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-md py-2 font-semibold">Card</button>
                    <button className="flex-1 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 rounded-md py-2 font-semibold transition-colors">PayPal</button>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-500 hover:bg-blue-600 py-6 text-base">Donate $50 Now</Button>
                
                <p className="text-xs text-center text-gray-500">
                  Secure payment • Zero platform fees • Instant delivery
                </p>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-md border border-gray-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Funds delivered</p>
                  <p className="text-xs text-gray-500">in under 10 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
