
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getAllCampaigns } from '@/services/campaignService';
import CampaignCard from '@/components/CampaignCard';
import { Campaign } from '@/types';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const PAGE_SIZE = 9;

const AllCampaignsPage = () => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_funded' | 'least_funded'>('newest');
  
  const { data: campaigns, isLoading, isError } = useQuery({
    queryKey: ['all-campaigns', page, sortBy],
    queryFn: () => getAllCampaigns(page, PAGE_SIZE, sortBy),
  });
  
  const handleSortChange = (value: string) => {
    setSortBy(value as 'newest' | 'oldest' | 'most_funded' | 'least_funded');
    setPage(1);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">All Campaigns</h1>
          
          <div className="w-full md:w-auto">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most_funded">Most Funded</SelectItem>
                <SelectItem value="least_funded">Least Funded</SelectItem>
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
            <p className="text-gray-500">No campaigns found.</p>
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
                
                {Array.from({ length: Math.min(5, page + 1) }).map((_, i) => {
                  const pageNum = i + 1 <= page ? page - (4 - i) : i + 1;
                  if (pageNum <= 0) return null;
                  
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
                
                {campaigns?.length === PAGE_SIZE && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(p => p + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AllCampaignsPage;
