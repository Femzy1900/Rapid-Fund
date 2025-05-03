
import React from 'react';
import { CryptoDonation } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { getTokenUSDPrice } from '@/services/cryptoService';

interface CryptoDonationsListProps {
  donations: CryptoDonation[];
  isLoading?: boolean;
}

const CryptoDonationsList = ({ donations, isLoading }: CryptoDonationsListProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading crypto donations...</div>;
  }
  
  if (!donations?.length) {
    return <div className="text-center py-4 text-gray-500">No crypto donations yet.</div>;
  }
  
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <Card key={donation.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {donation.is_anonymous ? "Anonymous" : shortenAddress(donation.wallet_address)}
                </p>
                {donation.message && (
                  <p className="text-gray-600 text-sm mt-1">{donation.message}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(donation.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold">{donation.amount} {donation.token_type}</span>
                {donation.usd_value_at_time && (
                  <p className="text-xs text-gray-500">
                    ≈ {formatCurrency(donation.usd_value_at_time)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              <a 
                href={`https://etherscan.io/tx/${donation.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Etherscan
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CryptoDonationsList;
