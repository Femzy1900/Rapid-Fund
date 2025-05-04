
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAllWithdrawalRequests, updateWithdrawalRequestStatus, checkIfUserIsAdmin } from '@/services/withdrawalService';
import { getAllCryptoWithdrawals, updateCryptoWithdrawalStatus } from '@/services/adminService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { WithdrawalRequest, CryptoWithdrawal } from '@/types';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for traditional withdrawal requests
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for crypto withdrawal requests
  const [cryptoDialogOpen, setCryptoDialogOpen] = useState(false);
  const [selectedCryptoRequest, setSelectedCryptoRequest] = useState<CryptoWithdrawal | null>(null);
  const [cryptoAction, setCryptoAction] = useState<'approve' | 'reject'>('approve');
  const [cryptoNotes, setCryptoNotes] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isCryptoProcessing, setIsCryptoProcessing] = useState(false);
  
  // Check if user is admin
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: () => user ? checkIfUserIsAdmin(user.id) : Promise.resolve(false),
    enabled: !!user
  });
  
  // Fetch withdrawal requests if user is admin
  const { data: withdrawalRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['adminWithdrawalRequests'],
    queryFn: getAllWithdrawalRequests,
    enabled: !!isAdmin
  });

  // Fetch crypto withdrawal requests if user is admin
  const { data: cryptoWithdrawals, isLoading: cryptoRequestsLoading } = useQuery({
    queryKey: ['adminCryptoWithdrawals'],
    queryFn: getAllCryptoWithdrawals,
    enabled: !!isAdmin
  });
  
  React.useEffect(() => {
    // Redirect if not authenticated
    if (!user && !isAdminLoading) {
      navigate('/auth');
    }
    // Redirect if authenticated but not admin
    else if (user && !isAdminLoading && isAdmin === false) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, isAdmin, isAdminLoading, navigate, toast]);
  
  const openActionDialog = (request: WithdrawalRequest, actionType: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAction(actionType);
    setNotes('');
    setDialogOpen(true);
  };
  
  const openCryptoActionDialog = (request: CryptoWithdrawal, actionType: 'approve' | 'reject') => {
    setSelectedCryptoRequest(request);
    setCryptoAction(actionType);
    setCryptoNotes('');
    setTxHash('');
    setCryptoDialogOpen(true);
  };
  
  const handleProcessRequest = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await updateWithdrawalRequestStatus(
        selectedRequest.id, 
        action === 'approve' ? 'approved' : 'rejected',
        notes
      );
      
      queryClient.invalidateQueries({
        queryKey: ['adminWithdrawalRequests']
      });
      
      toast({
        title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The withdrawal request has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
      });
      
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} request`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleProcessCryptoRequest = async () => {
    if (!selectedCryptoRequest) return;
    
    setIsCryptoProcessing(true);
    try {
      await updateCryptoWithdrawalStatus(
        selectedCryptoRequest.id, 
        cryptoAction === 'approve' ? 'approved' : 'rejected',
        cryptoAction === 'approve' ? txHash : undefined,
        cryptoNotes
      );
      
      queryClient.invalidateQueries({
        queryKey: ['adminCryptoWithdrawals']
      });
      
      toast({
        title: `Crypto Request ${cryptoAction === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The crypto withdrawal request has been ${cryptoAction === 'approve' ? 'approved' : 'rejected'} successfully.`
      });
      
      setCryptoDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${cryptoAction} crypto request`,
        variant: "destructive"
      });
    } finally {
      setIsCryptoProcessing(false);
    }
  };
  
  // Loading state
  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-xl">Checking permissions...</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Only render if user is admin
  if (!isAdmin) {
    return null;
  }
  
  // Type assertion to fix the filter error
  const allRequests = withdrawalRequests as WithdrawalRequest[] || [];
  const allCryptoRequests = cryptoWithdrawals as CryptoWithdrawal[] || [];
  
  const pendingRequests = allRequests.filter(
    (req) => req.status === 'pending'
  );
  
  const processedRequests = allRequests.filter(
    (req) => req.status !== 'pending'
  );
  
  const pendingCryptoRequests = allCryptoRequests.filter(
    (req) => req.status === 'pending'
  );
  
  const processedCryptoRequests = allCryptoRequests.filter(
    (req) => req.status !== 'pending'
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage withdrawal requests and system settings</p>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              Pending Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </TabsTrigger>
            <TabsTrigger value="processed">
              Processed Requests
            </TabsTrigger>
            <TabsTrigger value="crypto-pending">
              Crypto Pending {pendingCryptoRequests.length > 0 && `(${pendingCryptoRequests.length})`}
            </TabsTrigger>
            <TabsTrigger value="crypto-processed">
              Crypto Processed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <div className="space-y-4">
              {requestsLoading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <WithdrawalRequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => openActionDialog(request, 'approve')}
                    onReject={() => openActionDialog(request, 'reject')}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No pending withdrawal requests at this time.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="processed">
            <div className="space-y-4">
              {requestsLoading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : processedRequests.length > 0 ? (
                processedRequests.map((request) => (
                  <WithdrawalRequestCard
                    key={request.id}
                    request={request}
                    isProcessed
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No processed withdrawal requests found.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="crypto-pending">
            <div className="space-y-4">
              {cryptoRequestsLoading ? (
                <div className="text-center py-8">Loading crypto requests...</div>
              ) : pendingCryptoRequests.length > 0 ? (
                pendingCryptoRequests.map((request) => (
                  <CryptoWithdrawalRequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => openCryptoActionDialog(request, 'approve')}
                    onReject={() => openCryptoActionDialog(request, 'reject')}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No pending crypto withdrawal requests at this time.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="crypto-processed">
            <div className="space-y-4">
              {cryptoRequestsLoading ? (
                <div className="text-center py-8">Loading crypto requests...</div>
              ) : processedCryptoRequests.length > 0 ? (
                processedCryptoRequests.map((request) => (
                  <CryptoWithdrawalRequestCard
                    key={request.id}
                    request={request}
                    isProcessed
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No processed crypto withdrawal requests found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} Withdrawal Request
            </DialogTitle>
            <DialogDescription>
              {action === 'approve' 
                ? 'Approving this request means the funds will be released to the campaign owner.'
                : 'Rejecting this request will require you to provide a reason.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <h3 className="font-medium">Request Details</h3>
              {selectedRequest && (
                <>
                  <p className="text-sm text-gray-600 mt-1">Campaign: {selectedRequest.campaign?.title || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Amount: {formatCurrency(selectedRequest.amount)}</p>
                  <p className="text-sm text-gray-600">Requested by: {selectedRequest.profiles?.full_name || 'Unknown'}</p>
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Add notes {action === 'reject' && '(required)'}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={action === 'approve' ? 'Optional notes' : 'Reason for rejection'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleProcessRequest} 
              disabled={isProcessing || (action === 'reject' && !notes.trim())}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={cryptoDialogOpen} onOpenChange={setCryptoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {cryptoAction === 'approve' ? 'Approve' : 'Reject'} Crypto Withdrawal Request
            </DialogTitle>
            <DialogDescription>
              {cryptoAction === 'approve' 
                ? 'Approving this request means the funds have been sent to the provided wallet address.'
                : 'Rejecting this request will require you to provide a reason.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <h3 className="font-medium">Request Details</h3>
              {selectedCryptoRequest && (
                <>
                  <p className="text-sm text-gray-600 mt-1">Campaign: {selectedCryptoRequest.campaign?.title || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Token: {selectedCryptoRequest.token_type}</p>
                  <p className="text-sm text-gray-600">Amount: {selectedCryptoRequest.amount} {selectedCryptoRequest.token_type}</p>
                  <p className="text-sm text-gray-600">Wallet: {selectedCryptoRequest.wallet_address}</p>
                  <p className="text-sm text-gray-600">Requested by: {selectedCryptoRequest.profiles?.full_name || 'Unknown'}</p>
                </>
              )}
            </div>
            
            {cryptoAction === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Transaction Hash (required)
                </label>
                <Input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Enter the transaction hash"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Add notes {cryptoAction === 'reject' && '(required)'}
              </label>
              <Textarea
                value={cryptoNotes}
                onChange={(e) => setCryptoNotes(e.target.value)}
                placeholder={cryptoAction === 'approve' ? 'Optional notes' : 'Reason for rejection'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCryptoDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleProcessCryptoRequest} 
              disabled={
                isCryptoProcessing || 
                (cryptoAction === 'reject' && !cryptoNotes.trim()) ||
                (cryptoAction === 'approve' && !txHash.trim())
              }
              variant={cryptoAction === 'approve' ? 'default' : 'destructive'}
            >
              {isCryptoProcessing ? 'Processing...' : cryptoAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

type WithdrawalRequestCardProps = {
  request: WithdrawalRequest;
  onApprove?: () => void;
  onReject?: () => void;
  isProcessed?: boolean;
};

const WithdrawalRequestCard = ({ request, onApprove, onReject, isProcessed = false }: WithdrawalRequestCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">
                {request.campaign?.title || 'Campaign'}
              </h3>
              <Badge className={
                request.status === 'approved' ? 'bg-green-500' :
                request.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
              }>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Requested by: {request.profiles?.full_name || 'Unknown user'}</p>
              <p>Amount: <span className="font-semibold">{formatCurrency(request.amount)}</span></p>
              <p>Bank: {request.bank_name}</p>
              <p>Account: {request.account_name} ({request.account_number})</p>
              <p className="mt-1 text-xs">Requested on: {new Date(request.created_at).toLocaleString()}</p>
              
              {request.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <p className="font-medium">Notes:</p>
                  <p>{request.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {!isProcessed && (
            <div className="flex md:flex-col gap-2 self-end md:self-center">
              <Button variant="default" onClick={onApprove}>
                Approve
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={onReject}>
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

type CryptoWithdrawalRequestCardProps = {
  request: CryptoWithdrawal & { 
    campaign?: { title: string },
    profiles?: { full_name: string | null }
  };
  onApprove?: () => void;
  onReject?: () => void;
  isProcessed?: boolean;
};

const CryptoWithdrawalRequestCard = ({ request, onApprove, onReject, isProcessed = false }: CryptoWithdrawalRequestCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">
                {request.campaign?.title || 'Campaign'}
              </h3>
              <Badge className={
                request.status === 'approved' ? 'bg-green-500' :
                request.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
              }>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Requested by: {request.profiles?.full_name || 'Unknown user'}</p>
              <p>Token: <span className="font-medium">{request.token_type}</span></p>
              <p>Amount: <span className="font-semibold">{request.amount} {request.token_type}</span></p>
              <p>Wallet: <span className="font-mono text-xs break-all">{request.wallet_address}</span></p>
              <p className="mt-1 text-xs">Requested on: {new Date(request.created_at).toLocaleString()}</p>
              
              {request.tx_hash && (
                <p className="mt-1 text-xs">
                  TX Hash: <span className="font-mono break-all">{request.tx_hash}</span>
                </p>
              )}
              
              {request.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <p className="font-medium">Notes:</p>
                  <p>{request.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {!isProcessed && (
            <div className="flex md:flex-col gap-2 self-end md:self-center">
              <Button variant="default" onClick={onApprove}>
                Approve
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={onReject}>
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
