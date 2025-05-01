
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createCampaign } from '@/services/campaignService';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Validation schema for campaign creation
const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  target_amount: z.coerce.number().positive('Target amount must be positive'),
  expires_at: z.string().refine(val => {
    const date = new Date(val);
    const now = new Date();
    return date > now;
  }, { message: 'Expiry date must be in the future' }),
  image_url: z.string().optional(),
  is_urgent: z.boolean().default(false),
});

const CreateCampaignPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a campaign",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [user, navigate]);
  
  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      target_amount: undefined,
      expires_at: '',
      image_url: '',
      is_urgent: false,
    },
  });
  
  const onSubmit = async (data: z.infer<typeof campaignSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a campaign",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const campaign = await createCampaign({
        ...data,
        user_id: user.id,
        raised_amount: 0,
        donors_count: 0,
        is_verified: false,
      });
      
      toast({
        title: "Campaign created",
        description: "Your campaign has been successfully created",
      });
      
      navigate(`/campaigns/${campaign.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating campaign",
        description: error.message || "An error occurred while creating your campaign",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Create a New Campaign</h1>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Help needed for..." {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, attention-grabbing title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your situation and why you need help..."
                          className="min-h-40"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide detailed information about your campaign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Medical">Medical</SelectItem>
                            <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                            <SelectItem value="Eviction Help">Eviction Help</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Community">Community</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="target_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to an image for your campaign
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="is_urgent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Mark as Urgent
                        </FormLabel>
                        <FormDescription>
                          Urgent campaigns are highlighted for immediate attention
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">
                  Create Campaign
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateCampaignPage;
