import React, { useState, useEffect } from 'react';
import { User, UserRole, TeamMessage } from '../types';
import { getMessages, addMessage, getPendingUsers, approveUser, rejectUser } from '../services/storageService';
import { Button } from '../components/Button';
import { Check, X, Send, User as UserIcon, ShieldAlert } from 'lucide-react';

interface AdminViewProps {
  currentUser: User;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'UPDATES' | 'APPROVALS'>('UPDATES');
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);

  const isMasterOrState = currentUser.role === UserRole.MASTER || currentUser.role === UserRole.STATE_HEAD;

  useEffect(() => {
    refreshData();
    // Refresh interval for messages
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const refreshData = () => {
    if (activeTab === 'UPDATES') {
      setMessages(getMessages());
    } else if (activeTab === 'APPROVALS' && isMasterOrState) {
      setPendingUsers(getPendingUsers());
    }
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: TeamMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    addMessage(msg);
    setNewMessage('');
    refreshData();
  };

  const handleApprove = (userId: string) => {
    approveUser(userId);
    refreshData();
  };

  const handleReject = (userId: string) => {
    if(confirm('Reject and delete this user registration?')) {
      rejectUser(userId);
      refreshData();
    }
  };

  return (
    <div className="animate-pop pb-20">
      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-4 shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab('UPDATES')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'UPDATES' ? 'bg-mint-100 text-mint-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Team Updates
        </button>
        {isMasterOrState && (
          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'APPROVALS' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'} flex items-center justify-center gap-2`}
          >
            Approvals
            {pendingUsers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingUsers.length}</span>}
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'UPDATES' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Post an Update</h3>
            <form onSubmit={handlePostMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share an improvement idea or update..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
              <Button type="submit" className="!px-3">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-800 text-sm">{msg.userName}</span>
                  <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 text-sm">{msg.content}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <p>No updates yet. Be the first to post!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'APPROVALS' && isMasterOrState && (
        <div className="space-y-3">
           <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start gap-2 text-xs text-orange-800 mb-4">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>New users cannot access the app until you approve them here.</p>
           </div>

           {pendingUsers.map(u => (
             <div key={u.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                   <UserIcon className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-800 text-sm">{u.name}</h4>
                   <p className="text-xs text-gray-500">{u.phone}</p>
                   <p className="text-xs text-gray-400">{u.district}</p>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button 
                  onClick={() => handleApprove(u.id)}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                  title="Approve"
                 >
                   <Check className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={() => handleReject(u.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  title="Reject"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
             </div>
           ))}

           {pendingUsers.length === 0 && (
             <div className="text-center py-10 text-gray-400">
               <p>No pending approvals.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};