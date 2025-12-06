
import React, { useState, useMemo } from 'react';
import { TN_DISTRICTS } from '../constants';
import { getDistrictStats } from '../services/storageService';
import { Search, ChevronRight, Users, ShieldCheck } from 'lucide-react';
import { UserRole, User } from '../types';

interface DashboardViewProps {
  onSelectDistrict: (district: string) => void;
  user: User;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectDistrict, user }) => {
  const [search, setSearch] = useState('');
  
  const isMaster = user.role === UserRole.MASTER || user.role === UserRole.STATE_HEAD;

  // STRICT DATA ISOLATION:
  // If user is NOT master, they ONLY get stats for their specific category.
  // This means a "School Boy" asking for stats will receive 0 for a district if there are only "School Girls" there.
  // The logic is handled by getDistrictStats filtering.
  const stats = useMemo(() => {
    return getDistrictStats(isMaster ? undefined : user.category);
  }, [user.category, isMaster]);

  const filteredDistricts = TN_DISTRICTS.filter(d => 
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome & Master Indicator */}
      {isMaster ? (
        <div className="bg-gray-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <h2 className="font-bold text-lg">Master Dashboard</h2>
            <p className="text-gray-400 text-xs">Full access to all 38 districts (All Categories)</p>
          </div>
          <ShieldCheck className="w-8 h-8 text-mint-400" />
        </div>
      ) : (
        // For regular users, show which database they are viewing
        <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
           <div>
            <h2 className="font-bold text-sm text-gray-800">My User Base</h2>
            <p className="text-mint-600 font-semibold text-xs">{user.category}</p>
          </div>
        </div>
      )}

      {/* Search Header */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search 38 Districts..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border-none shadow-sm bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-mint-500 outline-none text-gray-900 placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredDistricts.map((district) => {
          const count = stats[district] || 0;
          const isFull = count >= 30;
          
          return (
            <button
              key={district}
              onClick={() => onSelectDistrict(district)}
              className="group flex flex-col items-start p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-mint-300 hover:shadow-md transition-all active:scale-95 text-left"
            >
              <div className="flex justify-between w-full items-start mb-2">
                <div className={`p-2 rounded-lg ${count > 0 ? 'bg-mint-50 text-mint-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
                {isFull && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">FULL</span>}
              </div>
              
              <h3 className="font-bold text-gray-900 text-sm">{district}</h3>
              <div className="flex items-center justify-between w-full mt-1">
                <span className="text-xs text-gray-500 font-medium">
                  {count} / 30 Members
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-mint-500 transition-colors" />
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-mint-500 rounded-full transition-all duration-500"
                  style={{ width: `${(count / 30) * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {filteredDistricts.length === 0 && (
        <div className="text-center py-10 opacity-60">
          <p className="text-gray-500">No district found named "{search}"</p>
        </div>
      )}
    </div>
  );
};
