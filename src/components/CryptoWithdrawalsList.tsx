
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CryptoWithdrawal } from '@/types';

interface CryptoWithdrawalsListProps {
  withdrawals: CryptoWithdrawal[];
  isLoading?: boolean;
}

const CryptoWithdrawalsList = ({ withdrawals, isLoading }: CryptoWithdrawalsListProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading crypto withdrawals...</div>;
  }
  
  if (!withdrawals?.length) {
    return <div className="text-center py-4 text-gray-500">No withdrawal requests yet.</div>;
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };
  
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const shortenTxHash = (hash?: string) => {
    if (!hash) return '-';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };
  
  return (
    <div className="space-y-4">
      {withdrawals.map((withdrawal) => (
        <Card key={withdrawal.id}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(withdrawal.created_at).toLocaleDateString()}
                </p>
                <p className="font-medium mt-1">
                  {withdrawal.amount} {withdrawal.token_type}
                </p>
                <p className="text-sm mt-1">
                  To: <span className="font-mono">{shortenAddress(withdrawal.wallet_address)}</span>
                </p>
                
                {withdrawal.tx_hash && (
                  <a 
                    href={`https://etherscan.io/tx/${withdrawal.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Tx: {shortenTxHash(withdrawal.tx_hash)}
                  </a>
                )}
              </div>
              <Badge className={`${getStatusColor(withdrawal.status)} mt-2 md:mt-0`}>
                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CryptoWithdrawalsList;
