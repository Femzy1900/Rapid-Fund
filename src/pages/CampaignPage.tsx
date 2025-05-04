
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCampaignById, deleteCampaign } from '@/services/campaignService';
import { getDonationsByCampaign, subscribeToNewDonations, subscribeToCryptoDonations } from '@/services/donationService';
import { getWithdrawalRequestsByCampaign } from '@/services/withdrawalService';
import { getCryptoDonationsByCampaign, getCryptoWithdrawalsByCampaign } from '@/services/cryptoService';
import { getCommentsByCampaign } from '@/services/commentService';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Heart, 
  Share2, 
  Wallet, 
  MessageCircle,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, calculateDaysLeft } from '@/utils/formatters';
import WithdrawalRequestForm from '@/components/WithdrawalRequestForm';
import WithdrawalRequestsList from '@/components/WithdrawalRequestsList';
import CryptoDonationForm from '@/components/CryptoDonationForm';
import CryptoWithdrawalForm from '@/components/CryptoWithdrawalForm';
import CryptoDonationsList from '@/components/CryptoDonationsList';
import CryptoWithdrawalsList from '@/components/CryptoWithdrawalsList';
import CommentsList from '@/components/CommentsList';
import AddCommentForm from '@/components/AddCommentForm';
import { Donation } from '@/types';
import { createStripeCheckoutSession } from '@/services/donationService';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import PhantomDonationForm from '@/components/PhantomDonationForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast: hookToast } = useToast();

  const [donationAmount, setDonationAmount] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalSheetOpen, setWithdrawalSheetOpen] = useState(false);
  const [cryptoWithdrawalSheetOpen, setCryptoWithdrawalSheetOpen] = useState(false);
  const [cryptoDonationSheetOpen, setCryptoDonationSheetOpen] = useState(false);
  const [phantomDonationSheetOpen, setPhantomDonationSheetOpen] = useState(false);
  const [donationTab, setDonationTab] = useState('fiat');
  const [shareTooltip, setShareTooltip] = useState('Copy link');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getCommentsByCampaign(id as string),
    enabled: !!id
  });

  const { data: campaignDonation } = useQuery({
    queryKey: ['donations', user?.id],
    queryFn: () => user ? getDonationsByCampaign(campaign.id) : Promise.reject('Not authenticated'),
    enabled: !!user
  });

  console.log('Campaign:', campaign);
  console.log('Donations:', donations); 
  console.log('Campaign Donation:', campaignDonation);

  // Calculate total donations and donors  
  const totalRaised = campaignDonation?.reduce((sum: number, donation: Donation) =>
    sum + (donation.amount || 0), 0) || 0;
  const totalDonors = campaignDonation?.length || 0;

  // Update campaign.raised_amount with totalRaised
  const updateRaisedAmount = async () => {
    if (campaign) {
      campaign.raised_amount = totalRaised;
      await supabase
        .from('campaigns')
        .update({ raised_amount: totalRaised, donors_count: totalDonors })
        .eq('id', campaign.id);
    }
  };

  updateRaisedAmount();

  // Add subscription for new donations notifications
  useEffect(() => {
    if (!id) return;
    
    // Subscribe to donation notifications
    const unsubscribeFromDonations = subscribeToNewDonations(id, (donation) => {
      // Show toast notification for new donation
      const amount = formatCurrency(donation.amount);
      const name = donation.is_anonymous ? "Anonymous" : "Supporter";
      
      hookToast({
        title: "New donation received!",
        description: `${name} donated ${amount}`
      });
      
      // Also refresh the donations data
      queryClient.invalidateQueries({ queryKey: ['donations', id] });
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    });
    
    // Subscribe to crypto donation notifications
    const unsubscribeFromCryptoDonations = subscribeToCryptoDonations(id, (donation) => {
      // Show toast notification for new crypto donation
      const amount = `${donation.amount} ${donation.token_type}`;
      const name = donation.is_anonymous ? "Anonymous" : "Supporter";
      
      hookToast({
        title: "New crypto donation received!",
        description: `${name} donated ${amount}`
      });
      
      // Also refresh the crypto donations data
      queryClient.invalidateQueries({ queryKey: ['cryptoDonations', id] });
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    });
    
    // Subscribe to campaigns table updates
    const channel = supabase
      .channel('campaign-updates')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `id=eq.${id}`
        },
        (payload) => {
          // Invalidate and refetch campaign data
          queryClient.invalidateQueries({ queryKey: ['campaign', id] });
        }
      )
      .subscribe();

    // Subscribe to donations table updates
    const donationsChannel = supabase
      .channel('donation-updates')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donations',
          filter: `campaign_id=eq.${id}`
        },
        () => {
          // Invalidate and refetch donations data
          queryClient.invalidateQueries({ queryKey: ['donations', id] });
          // Also refetch the campaign to update stats
          queryClient.invalidateQueries({ queryKey: ['campaign', id] });
        }
      )
      .subscribe();

    // Subscribe to crypto donations table updates
    const cryptoDonationsChannel = supabase
      .channel('crypto-donation-updates')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crypto_donations',
          filter: `campaign_id=eq.${id}`
        },
        () => {
          // Invalidate and refetch crypto donations data
          queryClient.invalidateQueries({ queryKey: ['cryptoDonations', id] });
          // Also refetch the campaign to update stats
          queryClient.invalidateQueries({ queryKey: ['campaign', id] });
        }
      )
      .subscribe();

    // Subscribe to comments table updates
    const commentsChannel = supabase
      .channel('comment-updates')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `campaign_id=eq.${id}`
        },
        () => {
          // Invalidate and refetch comments data
          queryClient.invalidateQueries({ queryKey: ['comments', id] });
        }
      )
      .subscribe();

    // Clean up subscriptions on unmount
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(donationsChannel);
      supabase.removeChannel(cryptoDonationsChannel);
      supabase.removeChannel(commentsChannel);
      unsubscribeFromDonations();
      unsubscribeFromCryptoDonations();
    };
  }, [id, queryClient]);

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

  const handlePhantomDonationSuccess = () => {
    setPhantomDonationSheetOpen(false);
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
        setShareTooltip('Copied!');
        setTimeout(() => {
          setShareTooltip('Copy link');
        }, 2000);
      })
      .catch((error) => {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy link. Please try again.');
      });
  };

  const handleDeleteCampaign = async () => {
    if (!campaign || !id) return;
    
    setIsDeleting(true);
    try {
      await deleteCampaign(id);
      toast.success('Campaign successfully deleted');
      navigate('/'); // Redirect to home page after deletion
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
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
                  className="group relative"
                  aria-label="Share campaign"
                  title={shareTooltip}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share
                  <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {shareTooltip}
                  </span>
                </Button>

                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/edit-campaign/${campaign.id}`)}
                    >
                      Edit Campaign
                    </Button>

                    <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            campaign and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteCampaign}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

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
                    <TabsTrigger value="comments">
                      Comments {comments?.length ? `(${comments.length})` : ''}
                    </TabsTrigger>
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

                  <TabsContent value="comments">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MessageCircle className="h-5 w-5 mr-2" /> Comments & Support
                        </CardTitle>
                        <CardDescription>
                          Leave a message of support for this campaign
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <AddCommentForm campaignId={id as string} />

                        <div className="pt-4 border-t">
                          <CommentsList
                            comments={comments || []}
                            campaignId={id as string}
                            isLoading={commentsLoading}
                          />
                        </div>
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
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="fiat">Card/Bank</TabsTrigger>
                            <TabsTrigger value="crypto">Ethereum</TabsTrigger>
                            <TabsTrigger value="solana">Solana</TabsTrigger>
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
                        ) : donationTab === 'crypto' ? (
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
                                Donate with Ethereum/ERC-20
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full md:max-w-md overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Donate with Cryptocurrency</SheetTitle>
                                <SheetDescription>
                                  Support this campaign using Ethereum or ERC-20 tokens through MetaMask.
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
                        ) : (
                          <Sheet
                            open={phantomDonationSheetOpen}
                            onOpenChange={setPhantomDonationSheetOpen}
                          >
                            <SheetTrigger asChild>
                              <Button
                                className="w-full flex items-center justify-center gap-2"
                                size="lg"
                                variant="default"
                              >
                                <Wallet className="h-4 w-4" />
                                Donate with Solana
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full md:max-w-md overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Donate with Solana</SheetTitle>
                                <SheetDescription>
                                  Support this campaign using Solana through the Phantom wallet.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="py-6">
                                <PhantomDonationForm
                                  campaignId={campaign.id}
                                  onSuccess={handlePhantomDonationSuccess}
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
