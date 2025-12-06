
import React, { useState, useEffect } from 'react';
import { Member, User, UserRole, UserCategory } from '../types';
import { TN_DISTRICTS } from '../constants';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, Phone, Trash2, Edit2, Shield, User as UserIcon, MapPin } from 'lucide-react';

interface GenericTeamViewProps {
  title: string;
  currentUser: User;
  fetchMembers: () => Member[];
  onSaveMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  colorTheme: 'purple' | 'orange';
}

export const GenericTeamView: React.FC<GenericTeamViewProps> = ({ 
  title, 
  currentUser, 
  fetchMembers, 
  onSaveMember, 
  onDeleteMember,
  colorTheme
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    role: 'Member', 
    district: TN_DISTRICTS[0],
    category: UserCategory.COLLEGE_BOYS // Default
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    setMembers(fetchMembers());
  };

  // Only STATE_HEAD and MASTER can edit these special teams
  const canEdit = currentUser.role === UserRole.STATE_HEAD || currentUser.role === UserRole.MASTER;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      id: editingMember ? editingMember.id : Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      district: formData.district,
      category: formData.category,
      joinedAt: editingMember ? editingMember.joinedAt : new Date().toISOString()
    };
    onSaveMember(newMember);
    setIsModalOpen(false);
    setEditingMember(null);
    setFormData({ name: '', phone: '', role: 'Member', district: TN_DISTRICTS[0], category: UserCategory.COLLEGE_BOYS });
    loadMembers();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      onDeleteMember(id);
      loadMembers();
    }
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({ 
      name: member.name, 
      phone: member.phone, 
      role: member.role, 
      district: member.district,
      category: member.category || UserCategory.COLLEGE_BOYS
    });
    setIsModalOpen(true);
  };

  const themeClasses = {
    purple: {
      bg: 'bg-purple-600',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
      btn: 'bg-purple-600 hover:bg-purple-700'
    },
    orange: {
      bg: 'bg-orange-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-100',
      btn: 'bg-orange-600 hover:bg-orange-700'
    }
  };

  const theme = themeClasses[colorTheme];

  return (
    <div className="pb-24 animate-pop">
      <div className={`${theme.bg} text-white p-6 rounded-2xl shadow-lg mb-6 flex justify-between items-center`}>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-white/80 text-sm mt-1">Core Team Management</p>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
          {members.length} / 30
        </div>
      </div>

      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-${colorTheme}-200 transition-colors`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${theme.light} ${theme.text} flex items-center justify-center font-bold text-lg shadow-inner`}>
                {member.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">{member.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   <Phone className="w-3 h-3" />
                   {member.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                   <MapPin className="w-3 h-3" />
                   {member.district}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href={`tel:${member.phone}`} className={`p-2 ${theme.light} ${theme.text} rounded-full hover:brightness-95 transform active:scale-90 transition-transform`}>
                <Phone className="w-4 h-4" />
              </a>
              {canEdit && (
                <>
                  <button onClick={() => openEdit(member)} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transform active:scale-90 transition-transform">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transform active:scale-90 transition-transform">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No members yet.</p>
          </div>
        )}
      </div>

      {canEdit && members.length < 30 && (
        <button
          onClick={() => {
            setEditingMember(null);
            setFormData({ name: '', phone: '', role: 'Member', district: TN_DISTRICTS[0], category: UserCategory.COLLEGE_BOYS });
            setIsModalOpen(true);
          }}
          className={`fixed bottom-6 right-6 ${theme.btn} text-white p-4 rounded-full shadow-lg active:scale-90 transition-transform z-20`}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                type="tel"
                required
              />
               <Input
                label="Designation"
                placeholder="Ex: Coordinator, President"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as UserCategory})}
                >
                  {Object.values(UserCategory).map(cat => (
                    <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">District</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-500"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                >
                  {TN_DISTRICTS.map(d => (
                    <option key={d} value={d} className="text-gray-900">{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gray-900">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
