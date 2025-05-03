import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getCampaigns, deleteCampaign } from '@/services/campaignService';
import { getProfile } from '@/services/profileService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Campaign, Donation } from '@/types';
import { Edit, Trash, Clock, Users, PlusCircle, DollarSign, TrendingUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import CryptoDashboardSection from '@/components/CryptoDashboardSection';
import { getDonationsByCampaign } from '@/services/donationService';
import { getDonationsByUser } from '@/services/donationService';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => user ? getProfile(user.id) : Promise.reject('Not authenticated'),
    enabled: !!user
  });



  const { data: userCampaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['userCampaigns', user?.id],
    queryFn: () => getCampaigns({ userId: user?.id }),
    enabled: !!user
  });
  
  const {data: campaignDonation} = useQuery({ 
    queryKey: ['donations', user?.id],
    queryFn: () => user ? getDonationsByCampaign(user.id) : Promise.reject('Not authenticated'),
    enabled: !!user
  });

  const { data: userDonations } = useQuery({
    queryKey: ['userDonations', user?.id],
    queryFn: () => user ? getDonationsByUser(user.id) : Promise.reject('Not authenticated'),
    enabled: !!user
  });
  
  console.log('User Donation:', userDonations);
  console.log('User Campaigns:', userCampaigns);
  console.log('Campaigns Donations:', campaignDonation);
  if (!user) {
    return null;
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const calculateDaysLeft = (expiresAt: string) => {
    const expiry = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Calculate total donations and donors
  const totalDonors = userCampaigns?.reduce((sum: number, campaign: Campaign) => 
    sum + (campaign.donors_count || 0), 0) || 0;

  const totalAmountDonated = userCampaigns?.reduce((sum: number, campaign: Campaign) => 
    sum + (campaign.raised_amount || 0), 0) || 0;

  const totalRaised = userDonations?.reduce((sum: number, donation: Donation) => 
    sum + (donation.amount || 0), 0) || 0;


  const totalDonorsCampaign = campaignDonation?.length || 0;
  
  

    
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">My Dashboard</h1>
          <Button 
            onClick={() => navigate('/create-campaign')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userCampaigns?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Donations Made</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 flex items-center">
                {formatCurrency(totalRaised || 0)}
                <DollarSign className="h-5 w-5 ml-1 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 flex items-center">
                {formatCurrency(totalAmountDonated || 0)}
                <TrendingUp className="h-5 w-5 ml-1 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 flex items-center">
                {totalDonors}
                <Users className="h-5 w-5 ml-1 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="active" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Campaigns</TabsTrigger>
            <TabsTrigger value="ended">Ended Campaigns</TabsTrigger>
          </TabsList>
          
          {campaignsLoading ? (
            <div className="text-center py-8">Loading your campaigns...</div>
          ) : (
            <>
              <TabsContent value="active">
                <div className="space-y-4">
                  {userCampaigns && userCampaigns.filter((campaign: Campaign) => 
                    new Date(campaign.expires_at) > new Date()
                  ).map((campaign: Campaign) => (
                    <CampaignListItem 
                      key={campaign.id} 
                      campaign={campaign} 
                      queryClient={queryClient}
                    />
                  ))}
                  
                  {userCampaigns?.filter((campaign: Campaign) => 
                    new Date(campaign.expires_at) > new Date()
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No active campaigns. <Button variant="link" onClick={() => navigate('/create-campaign')}>Create one now</Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="ended">
                <div className="space-y-4">
                  {userCampaigns && userCampaigns.filter((campaign: Campaign) => 
                    new Date(campaign.expires_at) <= new Date()
                  ).map((campaign: Campaign) => (
                    <CampaignListItem 
                      key={campaign.id} 
                      campaign={campaign} 
                      queryClient={queryClient}
                    />
                  ))}
                  
                  {userCampaigns?.filter((campaign: Campaign) => 
                    new Date(campaign.expires_at) <= new Date()
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No ended campaigns.
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
        
        {user && (
          <CryptoDashboardSection userId={user.id} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

const CampaignListItem = ({ campaign, queryClient }: { campaign: Campaign, queryClient: any }) => {
  const progressPercentage = Math.min(
    Math.round((campaign.raised_amount / campaign.target_amount) * 100),
    100
  );
  
  const daysLeft = calculateDaysLeft(campaign.expires_at);
  const isActive = new Date(campaign.expires_at) > new Date();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  function calculateDaysLeft(expiresAt: string) {
    const expiry = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  const handleEditCampaign = () => {
    navigate(`/edit-campaign/${campaign.id}`);
  };
  
  const handleDeleteCampaign = async () => {
    setIsDeleting(true);
    
    try {
      console.log('Deleting campaign ID:', campaign.id);

      await deleteCampaign(campaign.id);
      
      // Refresh campaigns data
      queryClient.invalidateQueries(['userCampaigns']);
      queryClient.invalidateQueries(['profile']);
      
      toast({
        title: "Campaign deleted",
        description: "The campaign has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error deleting campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfirmDialogOpen(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-24 h-20">
              <img 
                src={campaign.image_url || 'https://placehold.co/600x400?text=Campaign'} 
                alt={campaign.title}
                className="w-full h-full object-cover rounded"
              />
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <h3 
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    className="font-semibold cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    {campaign.title}
                  </h3>
                  
                  <Badge variant="outline" className="bg-blue-50">
                    {campaign.category}
                  </Badge>
                  
                  {campaign.is_urgent && (
                    <Badge className="bg-red-500 hover:bg-red-600">URGENT</Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={handleEditCampaign}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-red-600 hover:text-red-700"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium flex items-center">
                    {formatCurrency(campaign.raised_amount)}
                    <DollarSign className="h-3.5 w-3.5 ml-1 text-green-500" />
                  </span>
                  <span className="text-gray-500">of {formatCurrency(campaign.target_amount)}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div className="flex flex-col md:flex-row justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {isActive ? (
                    <span>{daysLeft} days left</span>
                  ) : (
                    <span className="text-red-500">Campaign ended</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{campaign.donors_count || 0} donors</span>
                </div>
                
                <div>{progressPercentage}% funded</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your campaign
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCampaign();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DashboardPage;
