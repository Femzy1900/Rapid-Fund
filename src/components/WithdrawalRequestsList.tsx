
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WithdrawalRequest } from '@/types';
import { formatCurrency } from '@/utils/formatters';

type WithdrawalRequestsListProps = {
  withdrawalRequests: WithdrawalRequest[];
  isLoading?: boolean;
};

const WithdrawalRequestsList = ({ withdrawalRequests, isLoading }: WithdrawalRequestsListProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading withdrawal requests...</div>;
  }
  
  if (!withdrawalRequests?.length) {
    return <div className="text-center py-4 text-gray-500">No withdrawal requests yet.</div>;
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Withdrawal History</h3>
      
      {withdrawalRequests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {formatCurrency(request.amount)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
                {request.notes && (
                  <p className="text-sm mt-1">
                    Note: {request.notes}
                  </p>
                )}
              </div>
              <Badge className={getStatusColor(request.status)}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WithdrawalRequestsList;
