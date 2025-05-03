
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserCryptoWithdrawals } from '@/services/cryptoService';
import { CryptoWithdrawal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CryptoDashboardSectionProps {
  userId: string;
}

const CryptoDashboardSection = ({ userId }: CryptoDashboardSectionProps) => {
  const { data: cryptoWithdrawals, isLoading } = useQuery({
    queryKey: ['cryptoWithdrawals', userId],
    queryFn: () => getUserCryptoWithdrawals(userId),
  });

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

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Crypto Withdrawals</h2>
      
      {isLoading ? (
        <div className="text-center py-4">Loading crypto withdrawals...</div>
      ) : cryptoWithdrawals?.length ? (
        <div className="space-y-4">
          {cryptoWithdrawals.map((withdrawal: CryptoWithdrawal) => (
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
                    <p className="text-sm text-gray-500 mt-1">
                      Campaign: {(withdrawal as any)?.campaign?.title || 'Unknown'}
                    </p>
                    
                    {withdrawal.tx_hash && (
                      <a 
                        href={`https://etherscan.io/tx/${withdrawal.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View on Etherscan
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
      ) : (
        <div className="text-center py-4 text-gray-500">
          No crypto withdrawals yet.
        </div>
      )}
    </div>
  );
};

export default CryptoDashboardSection;
