
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getCampaigns } from '@/services/campaignService';
import CampaignCard from '@/components/CampaignCard';
import { Campaign } from '@/types';

const AllCampaignsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const urgentFilter = searchParams.get('urgent') === 'true';

  // Fix the query to provide filters in the right format
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns
  });

  const filteredCampaigns = React.useMemo(() => {
    let filtered = campaigns || [];

    if (categoryFilter) {
      filtered = filtered.filter(campaign => campaign.category === categoryFilter);
    }

    if (urgentFilter) {
      filtered = filtered.filter(campaign => campaign.is_urgent);
    }

    return filtered;
  }, [campaigns, categoryFilter, urgentFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading campaigns...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Campaigns</h1>

        {filteredCampaigns.length === 0 ? (
          <div className="text-gray-500">No campaigns found matching your criteria.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign: Campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllCampaignsPage;
