
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAllWithdrawalRequests, updateWithdrawalRequestStatus, checkIfUserIsAdmin } from '@/services/withdrawalService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
import { WithdrawalRequest } from '@/types';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  console.log('Withdrawal Requests:', withdrawalRequests);
  
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
  
  const pendingRequests = allRequests.filter(
    (req) => req.status === 'pending'
  );
  
  const processedRequests = allRequests.filter(
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
            <TabsTrigger value="processed">Processed Requests</TabsTrigger>
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
                  <p className="text-sm text-gray-600 mt-1">Campaign: {selectedRequest.campaign_id.title}</p>
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
                {request.campaign_id.title || 'Campaign'}
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

export default AdminPage;
