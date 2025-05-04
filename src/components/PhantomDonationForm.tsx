
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { 
  isPhantomWalletAvailable,
  connectPhantomWallet,
  getConnectedPhantomWallet,
  makeCryptoDonation
} from '@/services/cryptoService';

interface PhantomDonationFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

const PhantomDonationForm = ({ campaignId, onSuccess }: PhantomDonationFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('1');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if Phantom is available
    const checkPhantomAvailability = () => {
      const isAvailable = isPhantomWalletAvailable();
      setIsPhantomInstalled(isAvailable);
      
      if (isAvailable) {
        checkConnectedWallet();
      }
    };
    
    checkPhantomAvailability();
    
    // Add event listener for when the phantom wallet is installed
    window.addEventListener('load', checkPhantomAvailability);
    
    return () => {
      window.removeEventListener('load', checkPhantomAvailability);
    };
  }, []);
  
  const checkConnectedWallet = async () => {
    try {
      const address = await getConnectedPhantomWallet();
      setWalletAddress(address);
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };
  
  const handleConnectWallet = async () => {
    if (!isPhantomInstalled) {
      setError('Please install Phantom wallet first');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const { publicKey } = await connectPhantomWallet();
      setWalletAddress(publicKey);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDonate = async () => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }
    
    if (!user) {
      navigate('/auth', { state: { from: `/campaigns/${campaignId}` } });
      return;
    }
    
    setIsDonating(true);
    setError(null);
    
    try {
      await makeCryptoDonation(
        campaignId,
        'SOL',
        amount,
        message,
        isAnonymous
      );
      
      toast.success('Donation successful! Thank you for your contribution.');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to make donation');
      toast.error(err.message || 'Failed to make donation');
    } finally {
      setIsDonating(false);
    }
  };
  
  if (!isPhantomInstalled) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Phantom Wallet Not Detected</AlertTitle>
        <AlertDescription>
          To donate with Solana, please install the Phantom wallet browser extension.
          <div className="mt-2">
            <a 
              href="https://phantom.app/download" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Install Phantom Wallet
            </a>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <div className="flex items-center">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
          <span className="ml-2 font-medium">SOL</span>
        </div>
      </div>
      
      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a message of support..."
          rows={3}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="anonymous" 
          checked={isAnonymous} 
          onCheckedChange={(checked) => setIsAnonymous(checked === true)}
        />
        <Label htmlFor="anonymous">Make this donation anonymous</Label>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleDonate} 
        className="w-full"
        disabled={isDonating || isConnecting}
      >
        {isDonating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
          </>
        ) : walletAddress ? (
          <>
            <Wallet className="mr-2 h-4 w-4" /> Donate with Solana
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" /> Connect Phantom Wallet
          </>
        )}
      </Button>
      
      {walletAddress && (
        <p className="text-xs text-gray-500 text-center">
          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </p>
      )}
    </div>
  );
};

export default PhantomDonationForm;
