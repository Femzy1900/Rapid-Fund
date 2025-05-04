import { supabase } from '@/integrations/supabase/client';
import { CryptoDonation, CryptoWithdrawal } from '@/types';
import { ethers } from 'ethers';
import { toast } from '@/components/ui/sonner';

// Token addresses (Ethereum mainnet)
const TOKEN_ADDRESSES = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Wrapped BTC on Ethereum
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
};

// Export the supported tokens for use in forms
export const SUPPORTED_TOKENS = {
  'ETH': 'Ethereum',
  'USDC': 'USD Coin',
  'USDT': 'Tether',
  'DAI': 'Dai Stablecoin',
  'WBTC': 'Wrapped Bitcoin',
  'LINK': 'Chainlink',
  'SOL': 'Solana',
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

// Check if MetaMask is available
export const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Check if Phantom wallet is available
export const isPhantomWalletAvailable = () => {
  const isPhantomInstalled = window.phantom?.solana?.isPhantom;
  return typeof window !== 'undefined' && isPhantomInstalled;
};

// Connect to MetaMask
export const connectMetaMask = async () => {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Connect to Phantom wallet
export const connectPhantomWallet = async () => {
  if (!isPhantomWalletAvailable()) {
    throw new Error('Phantom wallet is not installed');
  }
  
  try {
    const provider = window.phantom?.solana;
    const response = await provider.connect();
    const publicKey = response.publicKey.toString();
    
    return { provider, publicKey };
  } catch (error) {
    console.error('Error connecting to Phantom wallet:', error);
    throw error;
  }
};

// Get the connected wallet address if already connected (MetaMask)
export const getConnectedWallet = async () => {
  if (!isMetaMaskAvailable()) {
    return null;
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting connected wallet:', error);
    return null;
  }
};

// Get the connected Phantom wallet address if already connected
export const getConnectedPhantomWallet = async () => {
  if (!isPhantomWalletAvailable()) {
    return null;
  }
  
  try {
    const provider = window.phantom?.solana;
    if (provider?.isConnected) {
      return provider.publicKey.toString();
    }
    return null;
  } catch (error) {
    console.error('Error getting connected Phantom wallet:', error);
    return null;
  }
};

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
    } else if (tokenSymbol === 'SOL') {
      if (!isPhantomWalletAvailable()) {
        throw new Error('Phantom wallet is not installed');
      }
      
      const provider = window.phantom?.solana;
      const connection = provider.connection;
      const publicKey = provider.publicKey;
      
      const balance = await connection.getBalance(publicKey);
      return (balance / 1000000000).toString(); // Convert lamports to SOL
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
    'DAI': 1,    // $1 per DAI
    'WBTC': 60000, // $60000 per BTC
    'LINK': 15,  // $15 per LINK
    'SOL': 100,  // $100 per SOL
  };
  
  return prices[tokenSymbol] || 0;
};

export const sendTokens = async (
  tokenSymbol: string,
  amount: string,
  recipientAddress: string
) => {
  try {
    if (tokenSymbol === 'SOL') {
      return await sendSolanaTokens(amount, recipientAddress);
    }
    
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
      const contractWithSigner = new ethers.Contract(
        TOKEN_ADDRESSES[tokenSymbol],
        ERC20_ABI,
        signer
      );
      
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

// Send Solana tokens
export const sendSolanaTokens = async (
  amount: string,
  recipientAddress: string
) => {
  if (!isPhantomWalletAvailable()) {
    throw new Error('Phantom wallet is not installed');
  }
  
  try {
    const provider = window.phantom?.solana;
    const connection = provider.connection;
    const publicKey = provider.publicKey;
    
    // Convert amount to lamports (1 SOL = 10^9 lamports)
    const lamports = parseFloat(amount) * 1000000000;
    
    // Create transaction
    const transaction = new window.solanaWeb3.Transaction().add(
      window.solanaWeb3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new window.solanaWeb3.PublicKey(recipientAddress),
        lamports: lamports,
      })
    );
    
    // Send transaction
    const { signature } = await provider.signAndSendTransaction(transaction);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    
    return {
      success: true,
      txHash: signature,
      fromAddress: publicKey.toString(),
    };
  } catch (error) {
    console.error('Error sending SOL:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Mock Solana Web3.js for testing
const mockSolanaWeb3 = {
  Transaction: {},
  PublicKey: function(address: string) {
    return { toBase58: () => address };
  },
  SystemProgram: {
    transfer: (params: { fromPubkey: any; toPubkey: any; lamports: number }) => ({})
  }
};

// Make sure the makeSolanaTransaction function correctly uses the PublicKey
export const makeSolanaTransaction = async (
  amount: number,
  recipientAddress: string
) => {
  try {
    // In a real app, we would use actual Solana web3.js
    // This is a simplified mock
    const web3 = window.solanaWeb3 || mockSolanaWeb3;
    
    const lamports = amount * 1000000000; // Convert SOL to lamports
    const fromPubkey = await getConnectedPhantomWallet();
    const toPubkey = new web3.PublicKey(recipientAddress);
    
    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );
    
    return transaction;
  } catch (error) {
    console.error('Error creating Solana transaction:', error);
    throw new Error('Failed to create Solana transaction');
  }
};

export const makeCryptoDonation = async (
  campaignId: string,
  tokenType: string,
  amount: string,
  message: string = "",
  isAnonymous: boolean = false
) => {
  try {
    let donationResult;
    let walletAddress;
    
    if (tokenType === 'SOL') {
      // Connect to Phantom wallet and make donation
      const { publicKey } = await connectPhantomWallet();
      walletAddress = publicKey;
      
      // For a real implementation, the recipient address would be a campaign or platform wallet
      donationResult = await sendSolanaTokens(
        amount,
        "84zY1YR5akm7aMsZ8qEJSJxjstNKYhpQFVsPibLWNMdm" // Example Solana address
      );
    } else {
      // Connect to MetaMask and get wallet details for ETH and other tokens
      const { address } = await connectMetaMask();
      walletAddress = address;
      
      // Send the tokens (ETH or ERC-20)
      donationResult = await sendTokens(
        tokenType,
        amount,
        // In a real app, this would be the receiving address of the platform or campaign
        "0x0000000000000000000000000000000000000000"
      );
    }
    
    if (!donationResult.success) {
      throw new Error(donationResult.error || "Failed to send tokens");
    }
    
    // Get the current USD value of the donation
    const tokenUsdPrice = await getTokenUSDPrice(tokenType);
    const usdValue = parseFloat(amount) * tokenUsdPrice;
    
    // Record the donation in the database
    const { data, error } = await supabase
      .from('crypto_donations')
      .insert({
        campaign_id: campaignId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        wallet_address: walletAddress,
        token_type: tokenType,
        amount: parseFloat(amount),
        tx_hash: donationResult.txHash,
        message: message,
        is_anonymous: isAnonymous,
        usd_value_at_time: usdValue
      });
    
    if (error) throw error;
    
    toast.success('Donation successful!');
    return data;
  } catch (error) {
    console.error('Error making crypto donation:', error);
    toast.error('Donation failed: ' + error.message);
    throw error;
  }
};

export const createCryptoWithdrawalRequest = async (
  campaignId: string,
  walletAddress: string,
  tokenType: string,
  amount: number
) => {
  try {
    const { data, error } = await supabase
      .from('crypto_withdrawals')
      .insert({
        campaign_id: campaignId,
        user_id: (await supabase.auth.getUser()).data.user!.id,
        wallet_address: walletAddress,
        token_type: tokenType,
        amount: amount,
        status: 'pending'
      });
    
    if (error) throw error;
    
    toast.success('Withdrawal request submitted successfully');
    return data;
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    toast.error('Failed to submit withdrawal request');
    throw error;
  }
};

// Get all crypto withdrawals (for admin)
export const getAllCryptoWithdrawals = async (): Promise<CryptoWithdrawal[]> => {
  try {
    const { data, error } = await supabase
      .from('crypto_withdrawals')
      .select(`
        *,
        campaign:campaign_id (title),
        profiles:user_id (full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as CryptoWithdrawal[];
  } catch (error) {
    console.error('Error fetching all crypto withdrawals:', error);
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
