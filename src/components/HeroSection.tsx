
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-purple-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Send help in <span className="text-blue-600">seconds</span>, not days
            </h1>
            <p className="text-xl text-gray-700 max-w-lg">
              RapidFund connects people in urgent need with those who can help, instantly and with zero fees.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/create-campaign')}
                className="bg-blue-600 hover:bg-blue-700 text-lg"
              >
                Start a Campaign
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/#campaigns')}
                className="text-lg"
              >
                Donate Now
              </Button>
            </div>
            <div className="pt-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="font-bold text-2xl text-blue-600">100%</p>
                  <p className="text-sm text-gray-600">Fee-free</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-2xl text-blue-600">10min</p>
                  <p className="text-sm text-gray-600">Avg. setup time</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-2xl text-blue-600">24hrs</p>
                  <p className="text-sm text-gray-600">Fund access</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1000&auto=format&fit=crop" 
                alt="People helping each other"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg max-w-[220px]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-gray-800 font-medium">Live donations happening now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
