
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutGrid, FileText, ListChecks, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-[#ffffff50]">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-hospital-600 font-semibold text-lg">MediForm</span>
        </div>
        
        <nav className="flex items-center space-x-1">
          <NavItem 
            to="/" 
            isActive={isActive('/')} 
            icon={<LayoutGrid className="w-4 h-4" />}
            label="Dashboard" 
          />
          <NavItem 
            to="/templates" 
            isActive={isActive('/templates')} 
            icon={<FileText className="w-4 h-4" />}
            label="Templates" 
          />
          <NavItem 
            to="/records" 
            isActive={isActive('/records')} 
            icon={<ListChecks className="w-4 h-4" />}
            label="Records" 
          />
        </nav>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium hidden md:block">
                <span className="text-muted-foreground">Hello, </span>
                <span>{user?.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/login')}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

interface NavItemProps {
  to: string;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, isActive, icon, label }) => {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isActive 
          ? "bg-hospital-100 text-hospital-700" 
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Link>
  );
};

export default Header;
