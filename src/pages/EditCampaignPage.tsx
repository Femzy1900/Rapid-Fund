import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { getCampaignById, updateCampaign } from '@/services/campaignService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { format, addDays } from 'date-fns';
import ImageUpload from '@/components/ImageUpload';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters long' }),
  category: z.string({ required_error: 'Please select a category' }),
  image_url: z.string().optional(),
  target_amount: z.number().min(1, { message: 'Target amount must be at least 1' }),
  expires_at: z.string(),
  is_urgent: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const EditCampaignPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');


  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => id ? getCampaignById(id) : Promise.reject('No campaign ID'),
    enabled: !!id
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      image_url: '',
      target_amount: 0,
      expires_at: '',
      is_urgent: false,
    }
  });

  // Fill form with campaign data when loaded
  useEffect(() => {
    if (campaign) {
      const formattedDate = format(new Date(campaign.expires_at), 'yyyy-MM-dd');
      setImageUrl(campaign.image_url || '');
      form.reset({
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        image_url: campaign.image_url || '',
        target_amount: campaign.target_amount,
        expires_at: formattedDate,
        is_urgent: campaign.is_urgent || false,
      });
    }
  }, [campaign, form]);
  // Ensure user can only edit their own campaigns
  useEffect(() => {
    if (campaign && user && campaign.user_id !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own campaigns",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [campaign, user, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading campaign data...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-500 text-xl">Campaign not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    if (!user || !id) return;

    setIsSubmitting(true);
    try {
      await updateCampaign(id, {
        ...values,
        expires_at: new Date(values.expires_at).toISOString(),
      });

      toast({
        title: "Campaign updated successfully",
        description: "Your changes have been saved.",
      });

      navigate(`/campaigns/${id}`);
    } catch (error) {
      toast({
        title: "Error updating campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { label: 'Medical', value: 'Medical' },
    { label: 'Natural Disaster', value: 'Natural Disaster' },
    { label: 'Eviction Help', value: 'Eviction Help' },
    { label: 'Education', value: 'Education' },
    { label: 'Community', value: 'Community' },
    { label: 'Emergency', value: 'Emergency' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Campaign</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a clear, descriptive title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your campaign in detail"
                        {...field}
                        rows={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image URL */}
              {/* <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add an image URL to display" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <ImageUpload
                onImageUploaded={(url) => {
                  setImageUrl(url);
                  form.setValue("image_url", url);
                }}
                existingImageUrl={imageUrl}
              />


              {/* Target Amount */}
              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Goal ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your funding goal"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration Date */}
              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Urgent */}
              <FormField
                control={form.control}
                name="is_urgent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mark as Urgent</FormLabel>
                      <p className="text-sm text-gray-500">
                        This will highlight your campaign as requiring immediate attention
                      </p>
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

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/campaigns/${id}`)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Campaign'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditCampaignPage;
