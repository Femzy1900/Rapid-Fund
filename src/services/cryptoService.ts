
import { supabase } from '@/integrations/supabase/client';
import { CryptoDonation, CryptoWithdrawal } from '@/types';
import { ethers } from 'ethers';
import { toast } from '@/components/ui/sonner';

// Token addresses (Ethereum mainnet)
const TOKEN_ADDRESSES = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
};

// ABI for ERC20 tokens (minimal interface)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (boolean)',
  'function approve(address spender, uint256 amount) returns (boolean)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
];

export const getMetaMaskProvider = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }
  
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
};

export const getTokenContract = async (tokenSymbol: string) => {
  const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
  
  if (!tokenAddress) {
    throw new Error(`Unsupported token: ${tokenSymbol}`);
  }
  
  const provider = await getMetaMaskProvider();
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
};

export const getWalletAddress = async () => {
  const provider = await getMetaMaskProvider();
  const signer = await provider.getSigner();
  return await signer.getAddress();
};

// Get token balance for the connected wallet
export const getTokenBalance = async (tokenSymbol: string) => {
  try {
    if (tokenSymbol === 'ETH') {
      const provider = await getMetaMaskProvider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } else {
      const tokenContract = await getTokenContract(tokenSymbol);
      const provider = await getMetaMaskProvider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(address);
      return ethers.formatUnits(balance, decimals);
    }
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};

// Get approximate USD value of tokens
export const getTokenUSDPrice = async (tokenSymbol: string): Promise<number> => {
  // In a production app, you would fetch real-time prices from an API like CoinGecko
  // For the demo, we'll use placeholder values
  const prices = {
    'ETH': 3000, // $3000 per ETH
    'USDC': 1,   // $1 per USDC
    'USDT': 1,   // $1 per USDT
  };
  
  return prices[tokenSymbol] || 0;
};

export const sendTokens = async (
  tokenSymbol: string,
  amount: string,
  recipientAddress: string
) => {
  try {
    const provider = await getMetaMaskProvider();
    const signer = await provider.getSigner();
    const fromAddress = await signer.getAddress();
    
    if (tokenSymbol === 'ETH') {
      // Send ETH transaction
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(amount),
      });
      
      return {
        success: true,
        txHash: tx.hash,
        fromAddress,
      };
    } else {
      // Send ERC-20 transaction
      const tokenContract = await getTokenContract(tokenSymbol);
      const decimals = await tokenContract.decimals();
      const tokenAmount = ethers.parseUnits(amount, decimals);
      const contractWithSigner = tokenContract.connect(signer);
      
      const tx = await contractWithSigner.transfer(recipientAddress, tokenAmount);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        fromAddress,
      };
    }
  } catch (error) {
    console.error('Error sending tokens:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const submitCryptoDonation = async ({
  campaignId,
  userId,
  walletAddress,
  tokenType,
  amount,
  txHash,
  message,
  isAnonymous
}: {
  campaignId: string;
  userId?: string;
  walletAddress: string;
  tokenType: string;
  amount: string;
  txHash: string;
  message: string;
  isAnonymous: boolean;
}) => {
  try {
    // Get the USD value of the donation
    const tokenUsdPrice = await getTokenUSDPrice(tokenType);
    const usdValue = parseFloat(amount) * tokenUsdPrice;
    
    // Insert the crypto donation
    const { data, error } = await supabase
      .from('crypto_donations')
      .insert({
        campaign_id: campaignId,
        user_id: userId || null,
        wallet_address: walletAddress,
        token_type: tokenType,
        amount: parseFloat(amount),
        tx_hash: txHash,
        message,
        is_anonymous: isAnonymous,
        usd_value_at_time: usdValue
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error submitting crypto donation:', error);
    throw error;
  }
};

export const getCryptoDonationsByCampaign = async (campaignId: string): Promise<CryptoDonation[]> => {
  try {
    const { data, error } = await supabase
      .from('crypto_donations')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as CryptoDonation[];
  } catch (error) {
    console.error('Error fetching crypto donations:', error);
    throw error;
  }
};

export const submitCryptoWithdrawal = async ({
  campaignId,
  userId,
  walletAddress,
  tokenType,
  amount
}: {
  campaignId: string;
  userId: string;
  walletAddress: string;
  tokenType: string;
  amount: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('crypto_withdrawals')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        wallet_address: walletAddress,
        token_type: tokenType,
        amount: parseFloat(amount)
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error submitting crypto withdrawal:', error);
    throw error;
  }
};

export const getCryptoWithdrawalsByCampaign = async (campaignId: string): Promise<CryptoWithdrawal[]> => {
  try {
    const { data, error } = await supabase
      .from('crypto_withdrawals')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as CryptoWithdrawal[];
  } catch (error) {
    console.error('Error fetching crypto withdrawals:', error);
    throw error;
  }
};

export const getUserCryptoDonations = async (userId: string): Promise<CryptoDonation[]> => {
  try {
    const { data, error } = await supabase
      .from('crypto_donations')
      .select('*, campaigns(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as CryptoDonation[];
  } catch (error) {
    console.error('Error fetching user crypto donations:', error);
    throw error;
  }
};

export const getUserCryptoWithdrawals = async (userId: string): Promise<CryptoWithdrawal[]> => {
  try {
    const { data, error } = await supabase
      .from('crypto_withdrawals')
      .select('*, campaigns(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as CryptoWithdrawal[];
  } catch (error) {
    console.error('Error fetching user crypto withdrawals:', error);
    throw error;
  }
};
