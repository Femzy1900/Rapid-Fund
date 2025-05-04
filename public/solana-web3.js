
// This is a mock implementation of the Solana Web3.js library for development
console.log('Solana Web3.js mock loaded');

// Mock for demonstration purposes
window.solanaWeb3 = {
  Transaction: function() {
    return {
      add: function(instruction) {
        console.log('Added instruction to transaction', instruction);
        return this;
      },
      serialize: function() {
        return new Uint8Array([1, 2, 3]); // Mock serialized transaction
      }
    };
  },
  SystemProgram: {
    transfer: function(params) {
      console.log('Creating transfer instruction with params', params);
      return {
        programId: 'MockProgramId',
        keys: [],
        data: new Uint8Array([1, 2, 3])
      };
    }
  },
  clusterApiUrl: function(network) {
    return `https://api.${network}.solana.com`;
  },
  PublicKey: function(pubkeyStr) {
    this.toString = function() {
      return pubkeyStr;
    };
    this.toBase58 = function() {
      return pubkeyStr;
    };
  }
};
