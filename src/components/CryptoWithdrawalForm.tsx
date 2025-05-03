
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Wallet } from 'lucide-react';
import { 
  isMetaMaskAvailable, 
  connectMetaMask, 
  SUPPORTED_TOKENS,
  createCryptoWithdrawalRequest,
  getConnectedWallet
} from '@/services/cryptoService';
import { ethers } from 'ethers';

interface CryptoWithdrawalFormProps {
  campaignId: string;
  userId: string;
  onSuccess?: () => void;
}

const CryptoWithdrawalForm = ({ campaignId, userId, onSuccess }: CryptoWithdrawalFormProps) => {
  const [amount, setAmount] = useState('0.01');
  const [tokenType, setTokenType] = useState('ETH');
  const [walletAddress, setWalletAddress] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    if (address) {
      setWalletAddress(address);
    }
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
  
  const handleSubmit = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }
    
    if (!ethers.isAddress(walletAddress)) {
      setError('Invalid Ethereum address');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      await createCryptoWithdrawalRequest(
        campaignId,
        walletAddress,
        tokenType,
        parseFloat(amount)
      );
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!isMetaMaskInstalled) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>MetaMask Not Detected</AlertTitle>
        <AlertDescription>
          To withdraw cryptocurrency, please install the MetaMask browser extension.
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
        <Label>Token Type</Label>
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
        <p className="text-xs text-gray-500 mt-1">
          Note: Withdrawal requests are subject to approval
        </p>
      </div>
      
      <div>
        <Label htmlFor="walletAddress">Wallet Address</Label>
        <Input
          id="walletAddress"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          className="font-mono"
        />
        
        {walletAddress ? (
          <p className="text-xs text-green-600 mt-1">Wallet address added</p>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleConnectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            Use MetaMask Address
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          'Submit Withdrawal Request'
        )}
      </Button>
    </div>
  );
};

export default CryptoWithdrawalForm;
