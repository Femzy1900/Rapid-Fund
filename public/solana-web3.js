
// This is just a placeholder file to include in our HTML.
// In a real project, we would use the actual Solana Web3.js library from npm.
console.log('Solana Web3.js mock loaded');

// Mock for demonstration purposes
window.solanaWeb3 = {
  Transaction: function() {
    return {
      add: function(instruction) {
        return this;
      }
    };
  },
  SystemProgram: {
    transfer: function(params) {
      return {};
    }
  }
};
