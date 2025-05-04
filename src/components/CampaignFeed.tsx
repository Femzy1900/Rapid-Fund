
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCampaigns } from '@/services/campaignService';
import CampaignCard from './CampaignCard';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types';

import { Loader2 } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const CAMPAIGNS_PER_PAGE = 6;

const CampaignFeed = () => {
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_funded' | 'least_funded'>('newest');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'regular'>('all');
  const [page, setPage] = useState(1);
  
  const { data: campaigns, isLoading, isError } = useQuery({
    queryKey: ['campaigns', category, sortBy, urgencyFilter, page],
    queryFn: () => getCampaigns({
      category: category !== 'all' ? category : undefined,
      isUrgent: urgencyFilter === 'urgent' ? true : (urgencyFilter === 'regular' ? false : undefined),
      sortBy,
      limit: CAMPAIGNS_PER_PAGE,
      offset: (page - 1) * CAMPAIGNS_PER_PAGE
    })
  });

  const categories = [
    { label: 'All Campaigns', value: 'all' },
    { label: 'Medical', value: 'Medical' },
    { label: 'Natural Disaster', value: 'Natural Disaster' },
    { label: 'Eviction Help', value: 'Eviction Help' },
    { label: 'Education', value: 'Education' },
    { label: 'Community', value: 'Community' },
    { label: 'Emergency', value: 'Emergency' },
  ];

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleSortChange = (value: 'newest' | 'oldest' | 'most_funded' | 'least_funded') => {
    setSortBy(value);
    setPage(1);
  };

  const handleUrgencyChange = (value: 'all' | 'urgent' | 'regular') => {
    setUrgencyFilter(value);
    setPage(1);
  };

  const totalPages = campaigns?.length === CAMPAIGNS_PER_PAGE ? page + 1 : page;


  return (
    <section className="bg-gray-50 py-12 md:py-20" id="campaigns">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Active Campaigns</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          These people need your help right now. Every contribution makes a difference, no matter how small.
        </p>
      </div>
      
      <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
        <Tabs defaultValue="all" className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="all" onClick={() => handleUrgencyChange('all')}>All</TabsTrigger>
            <TabsTrigger value="urgent" onClick={() => handleUrgencyChange('urgent')}>Urgent</TabsTrigger>
            <TabsTrigger value="regular" onClick={() => handleUrgencyChange('regular')}>Regular</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most_funded">Most Funded</SelectItem>
                <SelectItem value="least_funded">Least Funded</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error loading campaigns. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : campaigns?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No campaigns found for your current filters.</p>
          <Button onClick={() => {
            setCategory('all');
            setSortBy('newest');
            setUrgencyFilter('all');
            setPage(1);
          }} className="mt-4">
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign: Campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />

      ))}
    </div>
                
    <Pagination className="mt-8">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
                  </PaginationItem>
                )}
                
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        isActive={pageNum === page}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {campaigns?.length === CAMPAIGNS_PER_PAGE && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(p => p + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </>
        )}
      </div>
    </section>

  );
};

export default CampaignFeed;
