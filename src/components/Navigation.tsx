
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, Bell, BellDot } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { checkIfUserIsAdmin } from '@/services/withdrawalService';
import { getUnreadDonationNotifications } from '@/services/donationService';
import { formatCurrency } from '@/utils/formatters';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  // Function to reset notifications count to zero
  const handleNotificationClick = () => {
    setNotificationsCount(0);
  };

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: () => user ? checkIfUserIsAdmin(user.id) : Promise.resolve(false),
    enabled: !!user
  });

  // Get recent donation notifications
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['donationNotifications', user?.id],
    queryFn: () => user ? getUnreadDonationNotifications(user.id) : Promise.resolve([]),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (notifications) {
      setNotificationsCount(notifications.length);
    }
  }, [notifications]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDonorName = (donation: any) => {
    if (donation.is_anonymous) return 'Anonymous';
    return donation.user?.full_name || 'A supporter';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Campaigns', path: '/campaigns' },
    { name: 'About', path: '/about' },
    { name: 'Start Campaign', path: '/create-campaign' },
  ];

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="logo" className='w-[150px]' />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-600 hover:text-blue-500 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://github.com/shadcn.png" alt={user?.email || ""} />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Signed in as
                      </p>
                      <p className="text-sm font-medium leading-none text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">My Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${user.id}`}>Profile</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center">
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative mr-2">
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
            )}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-gray-600 hover:text-blue-500 font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    {user ? (
                      <>
                        <Link
                          to="/dashboard"
                          className="text-gray-600 hover:text-blue-500 font-medium py-2 block"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Dashboard
                        </Link>
                        <Link
                          to={`/profile/${user.id}`}
                          className="text-gray-600 hover:text-blue-500 font-medium py-2 block"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="text-gray-600 hover:text-blue-500 font-medium py-2 block"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-0 py-2 font-medium"
                          onClick={() => {
                            handleSignOut();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Sign out
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          navigate('/auth');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
