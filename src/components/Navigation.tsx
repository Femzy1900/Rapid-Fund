
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Bell,
  User
} from 'lucide-react';

const Navigation = () => {
  return (
    <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="font-bold text-xl">RapidRelief</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/campaigns" className="font-medium hover:text-blue-500 transition-colors">Campaigns</Link>
          <Link to="/how-it-works" className="font-medium hover:text-blue-500 transition-colors">How It Works</Link>
          <Link to="/about" className="font-medium hover:text-blue-500 transition-colors">About</Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="hidden md:flex gap-2">
            <User className="w-4 h-4" />
            Sign In
          </Button>
          <Button className="hidden md:inline-flex">Start a Campaign</Button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
