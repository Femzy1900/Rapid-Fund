
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const CATEGORIES = [
  "All",
  "Medical",
  "Natural Disaster",
  "Eviction Help", 
  "Education",
  "Family"
];

const CAMPAIGNS = [
  {
    id: 1,
    title: "Sarah's Emergency Surgery",
    description: "Sarah needs help with urgent medical expenses for a life-saving operation.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=500&h=300",
    category: "Medical",
    isVerified: true,
    isUrgent: true,
    target: 5000,
    raised: 3750,
    donorsCount: 87,
    timeLeft: "2 days",
    postedTime: "3 hours ago"
  },
  {
    id: 2,
    title: "Hurricane Relief for Adams Family",
    description: "The Adams family lost their home in the recent hurricane. They need immediate assistance.",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=500&h=300",
    category: "Natural Disaster",
    isVerified: true,
    isUrgent: true,
    target: 10000,
    raised: 6240,
    donorsCount: 134,
    timeLeft: "5 days",
    postedTime: "1 day ago"
  },
  {
    id: 3,
    title: "Help Michael Avoid Eviction",
    description: "Michael is a single father who recently lost his job and needs help with rent.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&h=300",
    category: "Eviction Help",
    isVerified: true,
    isUrgent: false,
    target: 2500,
    raised: 1800,
    donorsCount: 42,
    timeLeft: "6 days",
    postedTime: "12 hours ago"
  },
  {
    id: 4,
    title: "California Wildfire Relief",
    description: "Supporting families who lost everything in the recent wildfire outbreak.",
    image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=500&h=300",
    category: "Natural Disaster",
    isVerified: true,
    isUrgent: true,
    target: 15000,
    raised: 8750,
    donorsCount: 210,
    timeLeft: "8 days",
    postedTime: "2 days ago"
  }
];

const CampaignFeed = () => {
  const [activeCategory, setActiveCategory] = React.useState("All");

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Live Campaigns</h2>
            <p className="text-gray-600">People who need immediate financial support</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  activeCategory === category 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAMPAIGNS.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={campaign.image} 
                  alt={campaign.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {campaign.isUrgent && (
                    <div className="badge-urgent">
                      <Clock className="w-3 h-3" />
                      Urgent
                    </div>
                  )}
                  {campaign.isVerified && (
                    <div className="badge-verified">
                      <Check className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {campaign.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  Posted {campaign.postedTime}
                </div>
              </div>
              
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">${campaign.raised.toLocaleString()} raised</span>
                    <span className="text-gray-500">${campaign.target.toLocaleString()}</span>
                  </div>
                  <Progress value={(campaign.raised / campaign.target) * 100} className="h-2" />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">{campaign.donorsCount} donors</span>
                    <span className="text-gray-500">{campaign.timeLeft} left</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1">Donate Now</Button>
                  <Button variant="outline" className="px-3">Share</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button variant="outline" className="px-8">
            View All Campaigns
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CampaignFeed;
