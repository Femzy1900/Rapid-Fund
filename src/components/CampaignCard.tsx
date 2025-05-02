
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Campaign } from '@/types';
import { CheckCircle, Clock, Users, DollarSign } from 'lucide-react';
import { formatCurrency, calculateDaysLeft } from '@/utils/formatters';

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const progressPercentage = Math.min(
    Math.round((campaign.raised_amount / campaign.target_amount) * 100),
    100
  );
  
  const daysLeft = calculateDaysLeft(campaign.expires_at);
  
  return (
    <Link to={`/campaigns/${campaign.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
        <div className="relative">
          <img
            src={campaign.image_url || 'https://placehold.co/600x400?text=Campaign+Image'}
            alt={campaign.title}
            className="h-48 w-full object-cover"
          />
          {campaign.is_urgent && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">URGENT</Badge>
          )}
          {campaign.is_verified && (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="bg-blue-50">
              {campaign.category}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
            </div>
          </div>
          <h3 className="font-semibold text-lg mt-2 line-clamp-2">{campaign.title}</h3>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-gray-600 text-sm line-clamp-2">{campaign.description}</p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium flex items-center">
                {formatCurrency(campaign.raised_amount)}
                <DollarSign className="h-3 w-3 ml-1 text-green-500" />
              </span>
              <span className="text-gray-500">of {formatCurrency(campaign.target_amount)}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
        
        <CardFooter>
          <div className="w-full flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>{campaign.donors_count} donors</span>
            </div>
            <span>{progressPercentage}% funded</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CampaignCard;
