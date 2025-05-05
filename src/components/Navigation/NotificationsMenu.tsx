
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { getUnreadDonationNotifications } from '@/services/donationService';
import { formatCurrency } from '@/utils/formatters';

interface NotificationsMenuProps {
  userId?: string;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({ userId }) => {
  const [notificationsCount, setNotificationsCount] = useState(0);
  
  // Get recent donation notifications
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['donationNotifications', userId],
    queryFn: () => getUnreadDonationNotifications(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (notifications) {
      setNotificationsCount(notifications.length);
    }
  }, [notifications]);

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDonorName = (donation: any) => {
    if (donation.is_anonymous) return 'Anonymous';
    return donation.profiles?.full_name || 'A supporter';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {notificationsCount > 0 ? (
            <BellDot className="h-5 w-5 text-blue-500" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {notificationsCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
              {notificationsCount > 9 ? '9+' : notificationsCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-96 overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Donations</h3>
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No recent donations
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((donation: any) => (
              <div key={donation.id} className="p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getDonorName(donation)}</span>
                  <span className="text-sm text-gray-500">{formatNotificationTime(donation.created_at)}</span>
                </div>
                <div className="mt-1">
                  <span className="text-green-600 font-medium">{formatCurrency(donation.amount)}</span>
                  {' '}to{' '}
                  <Link 
                    to={`/campaigns/${donation.campaign_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {donation.campaigns?.title}
                  </Link>
                </div>
                {donation.message && (
                  <div className="mt-1 text-sm text-gray-600 italic">"{donation.message}"</div>
                )}
              </div>
            ))}
          </div>
        )}
        {notifications.length > 0 && (
          <div className="p-2 border-t bg-gray-50">
            <Button
              variant="ghost"
              className="w-full py-2 text-center text-sm text-blue-600 hover:underline"
              onClick={() => {
                // Clear notifications or mark as read in the future
                refetchNotifications();
              }}
            >
              Refresh notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsMenu;
