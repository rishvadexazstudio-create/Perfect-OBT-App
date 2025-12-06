
import React from 'react';
import { Map, Building2, ShieldCheck, UserCircle, Megaphone } from 'lucide-react';

interface HomeMenuViewProps {
  onNavigate: (view: 'DASHBOARD' | 'STATE_OBT' | 'MASTER_OBT' | 'PROFILE' | 'ADMIN_UPDATES') => void;
}

export const HomeMenuView: React.FC<HomeMenuViewProps> = ({ onNavigate }) => {
  const menuItems = [
    {
      id: 'DASHBOARD',
      label: 'Districts',
      sub: 'View all 38 Districts',
      icon: Map,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'STATE_OBT',
      label: 'State OBT',
      sub: 'State Level Team',
      icon: Building2,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      id: 'MASTER_OBT',
      label: 'Master OBT',
      sub: 'Admin & Support',
      icon: ShieldCheck,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      id: 'PROFILE',
      label: 'User Profile',
      sub: 'My Account',
      icon: UserCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-800">Welcome to OBT</h2>
        <p className="text-gray-500 text-sm mt-1">Select an option to proceed</p>
      </div>

      {/* Main Admin / Updates Button */}
      <button
        onClick={() => onNavigate('ADMIN_UPDATES')}
        className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between group active:scale-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
             <Megaphone className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-md">Admin / Updates</h3>
            <p className="text-xs text-gray-400">Post improvements & messages</p>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
          OPEN
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as any)}
            className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-95 shadow-sm hover:shadow-md ${item.color.replace('bg-', 'hover:bg-opacity-80 ')} border-opacity-50 bg-white`}
          >
            <div className={`p-3 rounded-full mb-2 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-gray-800 text-sm">{item.label}</span>
            <span className="text-[10px] text-gray-400 mt-1">{item.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
