import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCampaigns } from '@/services/campaignService';
import CampaignCard from './CampaignCard';
import { Campaign } from '@/types';

interface CampaignFeedProps {
  showUrgentOnly?: boolean;
  limit?: number;
}

const CampaignFeed: React.FC<CampaignFeedProps> = ({ showUrgentOnly = false, limit = 6 }) => {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns
  });

  const filteredCampaigns = React.useMemo(() => {
    let filtered = [...campaigns];

    if (showUrgentOnly) {
      filtered = filtered.filter(campaign => campaign.is_urgent);
    }

    return filtered.slice(0, limit);
  }, [campaigns, showUrgentOnly, limit]);

  if (isLoading) {
    return <div className="text-center">Loading campaigns...</div>;
  }

  if (!campaigns || campaigns.length === 0) {
    return <div className="text-center">No campaigns found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCampaigns.map((campaign: Campaign) => (
        <Link key={campaign.id} to={`/campaigns/${campaign.id}`}>
          <CampaignCard campaign={campaign} />
        </Link>
      ))}
    </div>
  );
};

export default CampaignFeed;
