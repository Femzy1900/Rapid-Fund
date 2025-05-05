import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getProfile } from '@/services/profileService';
import { getWithdrawalRequestsByUser } from '@/services/withdrawalService';
import { getUserCryptoDonations, getUserCryptoWithdrawals } from '@/services/cryptoService';
import { getDonationsByUser } from '@/services/donationService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCampaigns } from '@/services/campaignService';
import { Campaign } from '@/types';
import CampaignCard from '@/components/CampaignCard';

const ProfilePage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
    enabled: !!user
  });
  
  const { data: userCampaigns } = useQuery({
    queryKey: ['userCampaigns', user?.id],
    queryFn: () => getCampaigns({ userId: user?.id }),
    enabled: !!user?.id
  });
  
  const { data: userDonations } = useQuery({
    queryKey: ['userDonations', user?.id],
    queryFn: () => getDonationsByUser(user?.id),
    enabled: !!user?.id
  });


  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };
  
  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading profile...</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (profileError || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-500 text-xl">Profile not found</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-grow text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">
                    {profile.full_name || 'Anonymous User'}
                  </h1>
                  
                  {profile.bio && (
                    <p className="text-gray-600 mb-3">{profile.bio}</p>
                  )}
                  
                  {profile.website && (
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline mb-4 block md:inline-block"
                    >
                      {profile.website}
                    </a>
                  )}
                </div>
                
                <div className="flex flex-row md:flex-col gap-4 md:gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.campaigns_created || 0}
                    </div>
                    <div className="text-sm text-gray-500">Campaigns</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(userDonations?.reduce((acc: number, donation: any) => acc + donation.amount, 0) || 0)}
                    </div>
                    <div className="text-sm text-gray-500">Donated</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="campaigns">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userCampaigns && userCampaigns.length > 0 ? (
                  userCampaigns.map((campaign: Campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No campaigns created yet.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="donations">
              <div className="grid grid-cols-1 gap-4">
                {userDonations && userDonations.length > 0 ? (
                  userDonations.map((donation: any) => (
                    <Card key={donation.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            Donated to {donation.campaigns?.title || 'Campaign'}
                          </h3>
                          {donation.message && (
                            <p className="text-sm text-gray-600 mt-1">{donation.message}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(donation.amount)}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No donations made yet.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
