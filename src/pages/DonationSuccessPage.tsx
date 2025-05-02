
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { processDonationFromStripe } from '@/services/donationService';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle } from 'lucide-react';

const DonationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const campaignId = searchParams.get('campaign_id');
    setCampaignId(campaignId);
    
    if (!sessionId || !campaignId) {
      toast({
        title: "Missing information",
        description: "Could not process your donation due to missing information.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    const processPayment = async () => {
      try {
        await processDonationFromStripe(sessionId);
        setIsProcessing(false);
        
        toast({
          title: "Thank you for your support!",
          description: "Your donation has been processed successfully.",
        });
      } catch (error) {
        toast({
          title: "Error processing donation",
          description: error.message,
          variant: "destructive",
        });
        navigate(`/campaigns/${campaignId}`);
      }
    };
    
    processPayment();
  }, [searchParams, navigate, toast]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-12">
        <div className="max-w-md w-full text-center">
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <h2 className="text-2xl font-bold">Processing your donation...</h2>
              <p className="text-gray-600">Please wait while we confirm your payment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold">Donation Successful!</h1>
              
              <p className="text-lg text-gray-600">
                Thank you for your generosity and support. Your donation will make a real difference.
              </p>
              
              <div className="pt-6 space-y-3">
                {campaignId && (
                  <Button asChild className="w-full">
                    <Link to={`/campaigns/${campaignId}`}>Return to Campaign</Link>
                  </Button>
                )}
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">Explore More Campaigns</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DonationSuccessPage;
