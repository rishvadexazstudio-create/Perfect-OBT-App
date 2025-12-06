
import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, Map, User as UserIcon, ArrowLeft, Megaphone } from 'lucide-react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onHome: () => void;
  onAdmin?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  onHome, 
  onAdmin,
  onBack,
  showBack = false,
  title = "OBT Connect" 
}) => {
  const isAdmin = user?.role === UserRole.MASTER || user?.role === UserRole.STATE_HEAD;

  return (
    <div className="min-h-screen flex flex-col bg-mint-50 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && onBack ? (
             <button onClick={onBack} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
               <ArrowLeft className="w-6 h-6 text-gray-700" />
             </button>
          ) : (
            <div className="cursor-pointer" onClick={onHome}>
               <Logo size="sm" />
            </div>
          )}
          
          <div onClick={!showBack ? onHome : undefined} className={!showBack ? "cursor-pointer" : ""}>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">{title}</h1>
          </div>
        </div>
        
        {user && !showBack && (
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 relative">
        {children}
      </main>

      {/* Bottom Nav */}
      {!showBack && user && (
        <div className="bg-white border-t border-gray-100 p-3 flex justify-around text-xs font-medium text-gray-400">
          <button className="flex flex-col items-center gap-1 text-mint-600" onClick={onHome}>
            <Map className="w-5 h-5" />
            Home
          </button>
          
          {onAdmin && (
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-mint-600 transition-colors" onClick={onAdmin}>
              <Megaphone className="w-5 h-5" />
              {isAdmin ? 'Admin' : 'Updates'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
