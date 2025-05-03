
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { CryptoDonation, CryptoWithdrawal } from '@/types';
import { toast } from '@/components/ui/sonner';

// ERC-20 Token ABI snippet (only for token transfers)
const minimalERC20ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function"
  }
];

// Common token addresses (for Ethereum mainnet)
export const SUPPORTED_TOKENS = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    address: null, // Native ETH
    decimals: 18,
    logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum mainnet USDC
    decimals: 6,
    logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum mainnet USDT
    decimals: 6,
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  }
};

// Check if MetaMask is available
export const isMetaMaskAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Connect to MetaMask and get the provider and signer
export const connectMetaMask = async () => {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    
    return {
      provider,
      signer,
      address,
      chainId: Number(network.chainId)
    };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Helper to get token contract
const getTokenContract = async (tokenAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(tokenAddress, minimalERC20ABI, signer);
};

// Helper to get current price of ETH/USDC in USD for conversion
const getTokenUSDPrice = async (tokenSymbol: string): Promise<number> => {
  try {
    // In production, you'd want to use a price feed API like CoinGecko or Chainlink
    // For this example, we'll use hardcoded values
    if (tokenSymbol === 'ETH') return 3000;  // Example price, $3000 per ETH
    if (tokenSymbol === 'USDC' || tokenSymbol === 'USDT') return 1; // Stablecoins are ~$1
    return 1; // Default
  } catch (error) {
    console.error('Error fetching price:', error);
    return 1; // Default fallback
  }
};

// Make a crypto donation
export const makeCryptoDonation = async (
  campaignId: string,
  tokenType: string,
  amount: string,
  message: string = '',
  isAnonymous: boolean = false
): Promise<CryptoDonation> => {
  try {
    const { signer, address } = await connectMetaMask();
    const tokenInfo = SUPPORTED_TOKENS[tokenType as keyof typeof SUPPORTED_TOKENS];
    
    if (!tokenInfo) {
      throw new Error(`Unsupported token: ${tokenType}`);
    }
    
    // Convert amount to correct decimals
    const decimals = tokenInfo.decimals;
    const tokenAmount = ethers.parseUnits(amount, decimals);
    
    // Get USD value for campaign stats
    const tokenUsdPrice = await getTokenUSDPrice(tokenType);
    const usdValue = parseFloat(amount) * tokenUsdPrice;
    
    let txHash;
    
    // Handle ETH or ERC-20 transfer
    if (tokenInfo.symbol === 'ETH') {
      // Send ETH transaction
      const recipientAddress = '0xYourProjectWalletAddress'; // Replace with your project's wallet address
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: tokenAmount,
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      txHash = tx.hash;
      
    } else if (tokenInfo.address) {
      // Send ERC-20 token transaction
      const tokenContract = await getTokenContract(tokenInfo.address, signer);
      const recipientAddress = '0xYourProjectWalletAddress'; // Replace with your project's wallet address
      
      const tx = await tokenContract.transfer(recipientAddress, tokenAmount);
      
      // Wait for transaction to be mined
      await tx.wait();
      txHash = tx.hash;
    } else {
      throw new Error(`Invalid token configuration for ${tokenType}`);
    }
    
    // Get authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();
    
    // Store the donation in the database
    const { data, error } = await supabase.from('crypto_donations').insert([{
      campaign_id: campaignId,
      user_id: user?.id || null,
      wallet_address: address,
      token_type: tokenType,
      amount: amount,
      tx_hash: txHash,
      message: message || null,
      is_anonymous: isAnonymous,
      usd_value_at_time: usdValue
    }]).select().single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    toast.success('Crypto donation successful!');
    
    return data as CryptoDonation;
  } catch (error: any) {
    toast.error(`Donation failed: ${error.message}`);
    throw error;
  }
};

// Get crypto donations by campaign
export const getCryptoDonationsByCampaign = async (campaignId: string): Promise<CryptoDonation[]> => {
  const { data, error } = await supabase
    .from('crypto_donations')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data as CryptoDonation[];
};

// Create a crypto withdrawal request
export const createCryptoWithdrawalRequest = async (
  campaignId: string,
  walletAddress: string,
  tokenType: string,
  amount: number
): Promise<CryptoWithdrawal> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }
    
    // Create the withdrawal request
    const { data, error } = await supabase
      .from('crypto_withdrawals')
      .insert([{
        campaign_id: campaignId,
        user_id: user.id,
        wallet_address: walletAddress,
        token_type: tokenType,
        amount: amount,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    toast.success('Crypto withdrawal request submitted successfully!');
    
    return data as CryptoWithdrawal;
  } catch (error: any) {
    toast.error(`Withdrawal request failed: ${error.message}`);
    throw error;
  }
};

// Get crypto withdrawal requests by campaign
export const getCryptoWithdrawalsByCampaign = async (campaignId: string): Promise<CryptoWithdrawal[]> => {
  const { data, error } = await supabase
    .from('crypto_withdrawals')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data as CryptoWithdrawal[];
};

// Get crypto withdrawal requests by user
export const getCryptoWithdrawalsByUser = async (userId: string): Promise<CryptoWithdrawal[]> => {
  const { data, error } = await supabase
    .from('crypto_withdrawals')
    .select('*, campaign:campaign_id(title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data as CryptoWithdrawal[];
};

// Check if MetaMask wallet is connected
export const getConnectedWallet = async (): Promise<string | null> => {
  if (!isMetaMaskAvailable()) {
    return null;
  }
  
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error checking connected wallet:', error);
    return null;
  }
};
