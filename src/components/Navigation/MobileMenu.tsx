
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface NavLink {
  name: string;
  path: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  isAuthenticated: boolean;
  isAdmin?: boolean;
  userId?: string;
  signOut: () => Promise<void>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  navLinks, 
  isAuthenticated, 
  isAdmin, 
  userId,
  signOut 
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
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
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-blue-500 font-medium py-2 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <Link
                  to={`/profile/${userId}`}
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
                  onClick={handleSignOut}
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
  );
};

export default MobileMenu;
