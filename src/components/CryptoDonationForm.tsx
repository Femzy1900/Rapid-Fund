
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  isMetaMaskAvailable, 
  connectMetaMask, 
  SUPPORTED_TOKENS,
  makeCryptoDonation,
  getConnectedWallet 
} from '@/services/cryptoService';

interface CryptoDonationFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

const CryptoDonationForm = ({ campaignId, onSuccess }: CryptoDonationFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('0.01');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tokenType, setTokenType] = useState('ETH');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if MetaMask is available
    setIsMetaMaskInstalled(isMetaMaskAvailable());
    
    // Check if wallet is already connected
    if (isMetaMaskAvailable()) {
      checkConnectedWallet();
    }
  }, []);
  
  const checkConnectedWallet = async () => {
    const address = await getConnectedWallet();
    setWalletAddress(address);
  };
  
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const { address } = await connectMetaMask();
      setWalletAddress(address);
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
    
    setIsDonating(true);
    setError(null);
    
    try {
      await makeCryptoDonation(
        campaignId,
        tokenType,
        amount,
        message,
        isAnonymous
      );
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to make donation');
    } finally {
      setIsDonating(false);
    }
  };
  
  if (!isMetaMaskInstalled) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>MetaMask Not Detected</AlertTitle>
        <AlertDescription>
          To donate with cryptocurrency, please install the MetaMask browser extension.
          <div className="mt-2">
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Install MetaMask
            </a>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Select Token</Label>
        <Select value={tokenType} onValueChange={setTokenType}>
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(SUPPORTED_TOKENS).map(token => (
              <SelectItem key={token} value={token}>
                <div className="flex items-center">
                  <span>{token}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="amount">Amount</Label>
        <div className="flex items-center">
          <Input
            id="amount"
            type="number"
            step="0.000001"
            min="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
          <span className="ml-2 font-medium">{tokenType}</span>
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
            <Wallet className="mr-2 h-4 w-4" /> Donate with {tokenType}
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" /> Connect MetaMask
          </>
        )}
      </Button>
      
      {walletAddress && (
        <p className="text-xs text-gray-500 text-center">
          Donating from: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </p>
      )}
    </div>
  );
};

export default CryptoDonationForm;
