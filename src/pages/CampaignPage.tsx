
import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCampaignById } from '@/services/campaignService';
import { getDonationsByCampaign, createStripeCheckoutSession, processDonationFromStripe } from '@/services/donationService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Donation } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState<number>(25);
  const [donationMessage, setDonationMessage] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Handle donation success from Stripe redirect
  React.useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const campaignId = searchParams.get('campaign_id');
    
    if (sessionId && campaignId) {
      const processPayment = async () => {
        try {
          await processDonationFromStripe(sessionId);
          
          // Clear URL params
          navigate(`/campaigns/${campaignId}`, { replace: true });
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
          queryClient.invalidateQueries({ queryKey: ['donations', campaignId] });
          
          toast({
            title: "Donation successful!",
            description: "Thank you for your generosity.",
            variant: "default",
          });
        } catch (error) {
          toast({
            title: "Error processing donation",
            description: error.message,
            variant: "destructive",
          });
        }
      };
      
      processPayment();
    }
  }, [searchParams, navigate, queryClient, toast]);
  
  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => id ? getCampaignById(id) : Promise.reject('No campaign ID'),
    enabled: !!id
  });
  
  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: ['donations', id],
    queryFn: () => id ? getDonationsByCampaign(id) : Promise.reject('No campaign ID'),
    enabled: !!id
  });

  const handleDonate = async () => {
    if (!id) return;
    
    setIsProcessing(true);
    
    try {
      const donorInfo = user ? { userId: user.id } : undefined;
      
      const { url } = await createStripeCheckoutSession(
        id, 
        donationAmount, 
        donationMessage, 
        isAnonymous, 
        donorInfo
      );
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      toast({
        title: "Error creating checkout",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
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

  if (campaignError || !campaign) {
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

  const calculateDaysLeft = () => {
    const expiry = new Date(campaign.expires_at).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const progressPercentage = Math.min(
    Math.round((campaign.raised_amount / campaign.target_amount) * 100),
    100
  );

  const daysLeft = calculateDaysLeft();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Details */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
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
            
            <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
            
            <div className="relative w-full h-80 mb-6">
              <img
                src={campaign.image_url || 'https://placehold.co/800x400?text=Campaign+Image'}
                alt={campaign.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <div className="flex items-center justify-between text-gray-500 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Created on {formatDate(campaign.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {daysLeft > 0 ? (
                  <span>{daysLeft} days left</span>
                ) : (
                  <span className="text-red-500">Campaign ended</span>
                )}
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">About this campaign</h2>
            <div className="prose max-w-none mb-8">
              <p className="whitespace-pre-line">{campaign.description}</p>
            </div>
          </div>
          
          {/* Donation Card */}
          <div>
            <Card className="sticky top-8">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-lg">
                      {formatCurrency(campaign.raised_amount)}
                    </span>
                    <span className="text-gray-500">
                      of {formatCurrency(campaign.target_amount)} goal
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="mt-2 text-sm text-gray-500 flex justify-between">
                    <span>{progressPercentage}% funded</span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{campaign.donors_count} donors</span>
                    </div>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full mb-4 bg-blue-500 hover:bg-blue-600"
                    >
                      Donate Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Make a Donation</DialogTitle>
                      <DialogDescription>
                        Your support means a lot. Enter the amount you wish to donate.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Donation Amount ($)</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(parseInt(e.target.value))}
                          placeholder="25"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                          id="message"
                          value={donationMessage}
                          onChange={(e) => setDonationMessage(e.target.value)}
                          placeholder="Add a message of support..."
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="anonymous"
                          checked={isAnonymous}
                          onCheckedChange={(checked) => 
                            setIsAnonymous(checked === true)
                          }
                        />
                        <label
                          htmlFor="anonymous"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Donate anonymously
                        </label>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleDonate} 
                        disabled={!donationAmount || donationAmount <= 0 || isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Continue to Payment"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {!user && (
                  <p className="text-sm text-center text-gray-500 mb-4">
                    You need to <a href="/auth" className="text-blue-500 hover:underline">log in</a> to track your donations
                  </p>
                )}
                
                <div className="text-sm text-gray-500">
                  <p className="mb-4">
                    This campaign {daysLeft > 0 ? 'will end' : 'ended'} on {formatDate(campaign.expires_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Recent Donations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Donations</h2>
          {donationsLoading ? (
            <div className="text-center py-8">Loading donations...</div>
          ) : donations && donations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donations.map((donation: Donation) => (
                <Card key={donation.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">
                        {donation.is_anonymous ? 'Anonymous' : 'Supporter'}
                      </div>
                      <div className="font-bold text-blue-600">
                        {formatCurrency(donation.amount)}
                      </div>
                    </div>
                    {donation.message && (
                      <p className="text-gray-600 text-sm">{donation.message}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(donation.created_at)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No donations yet. Be the first to donate!
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CampaignPage;
