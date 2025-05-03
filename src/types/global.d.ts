
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any; // Web3 Provider injected by MetaMask
  }
}

export {};
