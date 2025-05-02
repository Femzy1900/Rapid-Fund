
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createWithdrawalRequest } from '@/services/withdrawalService';
import { Campaign } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const withdrawalFormSchema = z.object({
  amount: z.string()
    .refine((val) => !isNaN(parseInt(val)), { message: 'Amount must be a number' })
    .refine((val) => parseInt(val) > 0, { message: 'Amount must be greater than 0' }),
  bank_name: z.string().min(2, { message: 'Bank name is required' }),
  account_number: z.string().min(5, { message: 'Valid account number is required' }),
  account_name: z.string().min(2, { message: 'Account name is required' })
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

type WithdrawalRequestFormProps = {
  campaign: Campaign;
  userId: string;
  onSuccess?: () => void;
  maxAmount?: number;
};

const WithdrawalRequestForm = ({ campaign, userId, onSuccess, maxAmount }: WithdrawalRequestFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: maxAmount?.toString() || campaign.raised_amount.toString(),
      bank_name: '',
      account_number: '',
      account_name: ''
    }
  });

  const { isSubmitting } = form.formState;
  
  const onSubmit = async (values: WithdrawalFormValues) => {
    try {
      const amount = parseInt(values.amount);
      
      // Validate amount against campaign raised amount
      if (amount > campaign.raised_amount) {
        toast({
          title: "Invalid withdrawal amount",
          description: `You can only withdraw up to ${campaign.raised_amount}`,
          variant: "destructive"
        });
        return;
      }
      
      await createWithdrawalRequest({
        campaign_id: campaign.id,
        user_id: userId,
        amount,
        bank_name: values.bank_name,
        account_number: values.account_number,
        account_name: values.account_name
      });
      
      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal request has been submitted and is pending review"
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Withdraw Funds</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter amount" 
                      {...field} 
                      max={campaign.raised_amount}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Withdrawal Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WithdrawalRequestForm;
