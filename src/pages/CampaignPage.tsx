
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCampaignById } from '@/services/campaignService';
import { getDonationsByCampaign } from '@/services/donationService';
import { getWithdrawalRequestsByCampaign } from '@/services/withdrawalService';
import { getCryptoDonationsByCampaign, getCryptoWithdrawalsByCampaign } from '@/services/cryptoService';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CheckCircle, Clock, DollarSign, Users, Heart, Share2, Wallet } from 'lucide-react';
import { formatCurrency, calculateDaysLeft } from '@/utils/formatters';
import WithdrawalRequestForm from '@/components/WithdrawalRequestForm';
import WithdrawalRequestsList from '@/components/WithdrawalRequestsList';
import CryptoDonationForm from '@/components/CryptoDonationForm';
import CryptoWithdrawalForm from '@/components/CryptoWithdrawalForm';
import CryptoDonationsList from '@/components/CryptoDonationsList';
import CryptoWithdrawalsList from '@/components/CryptoWithdrawalsList';
import { Donation } from '@/types';
import { createStripeCheckoutSession } from '@/services/donationService';
import { toast } from '@/components/ui/sonner';

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [donationAmount, setDonationAmount] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalSheetOpen, setWithdrawalSheetOpen] = useState(false);
  const [cryptoWithdrawalSheetOpen, setCryptoWithdrawalSheetOpen] = useState(false);
  const [cryptoDonationSheetOpen, setCryptoDonationSheetOpen] = useState(false);
  const [donationTab, setDonationTab] = useState('fiat');
  
  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaignById(id as string),
    enabled: !!id
  });
  
  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: ['donations', id],
    queryFn: () => getDonationsByCampaign(id as string),
    enabled: !!id
  });
  
  const { data: cryptoDonations, isLoading: cryptoDonationsLoading } = useQuery({
    queryKey: ['cryptoDonations', id],
    queryFn: () => getCryptoDonationsByCampaign(id as string),
    enabled: !!id
  });
  
  const { data: withdrawalRequests, isLoading: withdrawalRequestsLoading } = useQuery({
    queryKey: ['withdrawalRequests', id],
    queryFn: () => getWithdrawalRequestsByCampaign(id as string),
    enabled: !!id
  });
  
  const { data: cryptoWithdrawals, isLoading: cryptoWithdrawalsLoading } = useQuery({
    queryKey: ['cryptoWithdrawals', id],
    queryFn: () => getCryptoWithdrawalsByCampaign(id as string),
    enabled: !!id
  });
  
  const isOwner = user?.id === campaign?.user_id;
  
  if (campaignLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading campaign...</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-500 text-xl">Campaign not found</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const progressPercentage = Math.min(
    Math.round((campaign.raised_amount / campaign.target_amount) * 100),
    100
  );
  
  const daysLeft = calculateDaysLeft(campaign.expires_at);
  const isCampaignActive = daysLeft > 0;
  
  const handleDonateClick = async () => {
    if (!user) {
      navigate('/auth', { state: { from: `/campaigns/${id}` } });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { url } = await createStripeCheckoutSession(
        campaign.id,
        donationAmount,
        "",
        false,
        { userId: user.id }
      );
      
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdrawalSuccess = () => {
    setWithdrawalSheetOpen(false);
    queryClient.invalidateQueries({
      queryKey: ['withdrawalRequests', id]
    });
  };
  
  const handleCryptoWithdrawalSuccess = () => {
    setCryptoWithdrawalSheetOpen(false);
    queryClient.invalidateQueries({
      queryKey: ['cryptoWithdrawals', id]
    });
  };
  
  const handleCryptoDonationSuccess = () => {
    setCryptoDonationSheetOpen(false);
    queryClient.invalidateQueries({
      queryKey: ['cryptoDonations', id]
    });
    queryClient.invalidateQueries({
      queryKey: ['campaign', id]
    });
  };
  
  const handleShareCampaign = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Check out this campaign: ${campaign.title}`,
        url: url,
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        fallbackShare(url);
      });
    } else {
      fallbackShare(url);
    }
  };
  
  const fallbackShare = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('Campaign link copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy link. Please try again.');
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className="bg-blue-50">
                  {campaign.category}
                </Badge>
                
                {campaign.is_urgent && (
                  <Badge className="bg-red-500 hover:bg-red-600">URGENT</Badge>
                )}
                
                {campaign.is_verified && (
                  <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareCampaign}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
                
                {isOwner && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/edit-campaign/${campaign.id}`)}
                    >
                      Edit Campaign
                    </Button>
                    
                    <Sheet 
                      open={withdrawalSheetOpen} 
                      onOpenChange={setWithdrawalSheetOpen}
                    >
                      <SheetTrigger asChild>
                        <Button>Withdraw Funds</Button>
                      </SheetTrigger>
                      <SheetContent className="w-full md:max-w-md overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Withdraw Campaign Funds</SheetTitle>
                          <SheetDescription>
                            Request to withdraw funds from your campaign. Your request will be reviewed by our team.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                          <WithdrawalRequestForm 
                            campaign={campaign}
                            userId={user!.id}
                            onSuccess={handleWithdrawalSuccess}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                    
                    <Sheet 
                      open={cryptoWithdrawalSheetOpen} 
                      onOpenChange={setCryptoWithdrawalSheetOpen}
                    >
                      <SheetTrigger asChild>
                        <Button variant="outline">
                          <Wallet className="h-4 w-4 mr-2" /> Withdraw Crypto
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full md:max-w-md overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Withdraw Crypto Funds</SheetTitle>
                          <SheetDescription>
                            Request to withdraw cryptocurrency from your campaign.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                          <CryptoWithdrawalForm 
                            campaignId={campaign.id}
                            userId={user!.id}
                            onSuccess={handleCryptoWithdrawalSuccess}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{campaign.title}</h1>
            
            <div className="aspect-video w-full mb-6">
              <img 
                src={campaign.image_url || 'https://placehold.co/1200x600?text=Campaign+Image'} 
                alt={campaign.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="updates">Donations</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    {isOwner && (
                      <>
                        <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                        <TabsTrigger value="crypto-withdrawals">Crypto Withdrawals</TabsTrigger>
                      </>
                    )}
                  </TabsList>
                  
                  <TabsContent value="about">
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Target</p>
                            <p className="text-xl font-bold text-blue-700">{formatCurrency(campaign.target_amount)}</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Raised</p>
                            <p className="text-xl font-bold text-green-700">{formatCurrency(campaign.raised_amount)}</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Donors</p>
                            <p className="text-xl font-bold text-purple-700">{campaign.donors_count}</p>
                          </div>
                        </div>
                        <p className="whitespace-pre-line">{campaign.description}</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="updates">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Donations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {donationsLoading ? (
                          <div className="text-center py-4">Loading donations...</div>
                        ) : donations && donations.length > 0 ? (
                          <div className="space-y-4">
                            {donations.map((donation: Donation) => (
                              <div key={donation.id} className="pb-4 border-b last:border-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">
                                      {donation.is_anonymous ? "Anonymous" : "Supporter"}
                                    </p>
                                    {donation.message && (
                                      <p className="text-gray-600 text-sm mt-1">{donation.message}</p>
                                    )}
                                    <p className="text-gray-500 text-xs mt-1">
                                      {new Date(donation.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <span className="font-bold text-green-600">
                                    {formatCurrency(donation.amount)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No donations yet. Be the first to donate!
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="crypto">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cryptocurrency Donations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CryptoDonationsList 
                          donations={cryptoDonations || []}
                          isLoading={cryptoDonationsLoading}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {isOwner && (
                    <TabsContent value="withdrawals">
                      <Card>
                        <CardHeader>
                          <CardTitle>Withdrawal Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <WithdrawalRequestsList 
                            withdrawalRequests={withdrawalRequests || []}
                            isLoading={withdrawalRequestsLoading}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                  
                  {isOwner && (
                    <TabsContent value="crypto-withdrawals">
                      <Card>
                        <CardHeader>
                          <CardTitle>Crypto Withdrawal Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CryptoWithdrawalsList 
                            withdrawals={cryptoWithdrawals || []}
                            isLoading={cryptoWithdrawalsLoading}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
              
              <div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium flex items-center">
                          {formatCurrency(campaign.raised_amount)}
                          <DollarSign className="h-3 w-3 ml-1 text-green-500" />
                        </span>
                        <span className="text-gray-500">of {formatCurrency(campaign.target_amount)}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{campaign.donors_count} donors</span>
                        </div>
                        <span>{progressPercentage}% funded</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-600 mb-4">
                      <Clock className="h-4 w-4" />
                      {isCampaignActive ? (
                        <span>{daysLeft} days left</span>
                      ) : (
                        <span className="text-red-500">Campaign ended</span>
                      )}
                    </div>
                    
                    {isCampaignActive && (
                      <>
                        <Tabs value={donationTab} onValueChange={setDonationTab} className="mb-4">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="fiat">Card/Bank</TabsTrigger>
                            <TabsTrigger value="crypto">Crypto</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        
                        {donationTab === 'fiat' ? (
                          <>
                            <div className="mb-6">
                              <label className="block text-sm font-medium mb-1">
                                Donation Amount
                              </label>
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                {[10, 50, 100].map((amount) => (
                                  <Button
                                    key={amount}
                                    type="button"
                                    variant={donationAmount === amount ? "default" : "outline"}
                                    onClick={() => setDonationAmount(amount)}
                                  >
                                    ${amount}
                                  </Button>
                                ))}
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">$</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={donationAmount}
                                  onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                              </div>
                            </div>
                            
                            <Button
                              className="w-full flex items-center justify-center gap-2"
                              size="lg"
                              onClick={handleDonateClick}
                              disabled={isProcessing || donationAmount <= 0}
                            >
                              <Heart className="h-4 w-4" />
                              {isProcessing ? "Processing..." : "Donate Now"}
                            </Button>
                          </>
                        ) : (
                          <Sheet 
                            open={cryptoDonationSheetOpen} 
                            onOpenChange={setCryptoDonationSheetOpen}
                          >
                            <SheetTrigger asChild>
                              <Button
                                className="w-full flex items-center justify-center gap-2"
                                size="lg"
                              >
                                <Wallet className="h-4 w-4" />
                                Donate with Crypto
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full md:max-w-md overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Donate with Cryptocurrency</SheetTitle>
                                <SheetDescription>
                                  Support this campaign using cryptocurrency through MetaMask.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="py-6">
                                <CryptoDonationForm 
                                  campaignId={campaign.id}
                                  onSuccess={handleCryptoDonationSuccess}
                                />
                              </div>
                            </SheetContent>
                          </Sheet>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CampaignPage;
