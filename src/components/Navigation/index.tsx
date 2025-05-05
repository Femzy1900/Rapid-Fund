
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { checkIfUserIsAdmin } from '@/services/withdrawalService';
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: () => user ? checkIfUserIsAdmin(user.id) : Promise.resolve(false),
    enabled: !!user
  });

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
                <NotificationsMenu userId={user.id} />
                <UserMenu user={user} isAdmin={isAdmin} signOut={signOut} />
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            {user && (
              <div className="mr-2">
                <NotificationsMenu userId={user.id} />
              </div>
            )}
            <MobileMenu 
              navLinks={navLinks} 
              isAuthenticated={!!user} 
              isAdmin={isAdmin}
              userId={user?.id}
              signOut={signOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
