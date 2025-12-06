
import React, { useState, useEffect } from 'react';
import { Member, User, UserRole, UserCategory } from '../types';
import { getMembers, saveMember, deleteMember } from '../services/storageService';
import { analyzeTeam } from '../services/geminiService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Phone, Trash2, Edit2, Shield, User as UserIcon, Sparkles, GraduationCap, School } from 'lucide-react';
import { MAX_MEMBERS_PER_DISTRICT } from '../constants';

interface DistrictViewProps {
  districtName: string;
  currentUser: User;
  onBack: () => void;
}

export const DistrictView: React.FC<DistrictViewProps> = ({ districtName, currentUser, onBack }) => {
  const [members, setMembers] = useState<Member[]>([]);
  
  const isAdmin = currentUser.role === UserRole.MASTER || currentUser.role === UserRole.STATE_HEAD;

  // Determine active category. Admin defaults to college boys, User locked to their category.
  const [activeCategory, setActiveCategory] = useState<UserCategory>(
    isAdmin ? UserCategory.COLLEGE_BOYS : currentUser.category
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    role: UserRole.MEMBER as string,
    category: activeCategory 
  });

  // PERSONIFICATION LOGIC: Determine theme based on gender category
  const isGirlCategory = activeCategory.includes('Girls');
  const theme = isGirlCategory ? {
    bgSoft: 'bg-rose-50',
    textMain: 'text-rose-700',
    textSoft: 'text-rose-500',
    border: 'border-rose-100',
    button: 'bg-rose-600 hover:bg-rose-700',
    iconBg: 'bg-rose-100'
  } : {
    bgSoft: 'bg-mint-50',
    textMain: 'text-mint-700',
    textSoft: 'text-mint-600',
    border: 'border-mint-100',
    button: 'bg-mint-600 hover:bg-mint-700',
    iconBg: 'bg-mint-100'
  };

  // Reload members whenever district OR category changes
  // This ensures strict data loading. A user only fetches data for 'activeCategory'.
  useEffect(() => {
    loadMembers();
  }, [districtName, activeCategory]);

  // Update active category if non-admin user changes (safety)
  useEffect(() => {
    if (!isAdmin) {
      setActiveCategory(currentUser.category);
    }
  }, [currentUser, isAdmin]);

  const loadMembers = () => {
    // Explicitly ask for members of the ACTIVE category only.
    // This prevents loading other user base data entirely.
    setMembers(getMembers(districtName, activeCategory));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      id: editingMember ? editingMember.id : Date.now().toString(),
      district: districtName,
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      // FORCE category: If admin, use dropdown. If user, force their strict category.
      category: isAdmin ? formData.category : activeCategory, 
      joinedAt: editingMember ? editingMember.joinedAt : new Date().toISOString()
    };
    saveMember(newMember);
    setIsModalOpen(false);
    setEditingMember(null);
    setFormData({ name: '', phone: '', role: UserRole.MEMBER, category: activeCategory });
    loadMembers();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      deleteMember(id);
      loadMembers();
    }
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({ 
      name: member.name, 
      phone: member.phone, 
      role: member.role,
      category: member.category 
    });
    setIsModalOpen(true);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeTeam(districtName, members);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const canEdit = currentUser.role === UserRole.MASTER || 
                  (currentUser.role === UserRole.CAPTAIN && currentUser.district === districtName) ||
                  (currentUser.role === UserRole.STATE_HEAD);

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{districtName} Team</h2>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${theme.bgSoft} ${theme.textMain}`}>
          Total: {members.length}
        </span>
      </div>

      {/* Admin Tabs - ONLY for Admins */}
      {isAdmin ? (
        <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide">
          {Object.values(UserCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : (
        /* Regular User - Personified Header */
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.bgSoft} ${theme.textMain} ${theme.border}`}>
             {currentUser.category.includes('School') ? <School className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
             <span className="text-sm font-bold">{currentUser.category}</span>
          </div>
        </div>
      )}

      {/* Sub-header for current category stats */}
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-xs text-gray-500">Managing Members</span>
        <span className={`text-xs px-2 py-0.5 rounded font-bold ${members.length >= MAX_MEMBERS_PER_DISTRICT ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
          {members.length} / {MAX_MEMBERS_PER_DISTRICT}
        </span>
      </div>

      {/* AI Assistant Banner */}
      {members.length > 0 && (
        <div className={`bg-gradient-to-r ${isGirlCategory ? 'from-pink-50 to-rose-50 border-pink-100' : 'from-indigo-50 to-purple-50 border-indigo-100'} p-4 rounded-xl border mb-6 relative overflow-hidden`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-4 h-4 ${isGirlCategory ? 'text-pink-600' : 'text-purple-600'}`} />
            <h3 className={`text-sm font-bold ${isGirlCategory ? 'text-pink-800' : 'text-purple-800'}`}>AI Team Insights</h3>
          </div>
          
          {aiAnalysis ? (
            <div className="text-sm text-gray-700 leading-relaxed animate-fade-in">
              <p>{aiAnalysis}</p>
              <button onClick={() => setAiAnalysis(null)} className={`text-xs mt-2 hover:underline ${isGirlCategory ? 'text-pink-600' : 'text-purple-600'}`}>Clear</button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Analyze {activeCategory} team.</p>
              <Button onClick={runAnalysis} disabled={isAnalyzing} variant="secondary" className="!py-1 !px-3 !text-xs !h-8">
                {isAnalyzing ? 'Thinking...' : 'Analyze'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Member List */}
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between animate-pop">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${theme.bgSoft} flex items-center justify-center overflow-hidden border ${theme.border}`}>
                 <span className={`font-bold text-sm ${theme.textMain}`}>{member.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                  {member.name}
                  {member.role === UserRole.CAPTAIN && <Shield className="w-3 h-3 text-orange-500 fill-orange-500" />}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   <Phone className="w-3 h-3" />
                   {member.phone}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href={`tel:${member.phone}`} className={`p-2 rounded-full ${theme.bgSoft} ${theme.textSoft} hover:brightness-95`}>
                <Phone className="w-4 h-4" />
              </a>
              {canEdit && (
                <>
                  <button onClick={() => openEdit(member)} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100">
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
            <p>No members in {activeCategory} yet.</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {canEdit && members.length < MAX_MEMBERS_PER_DISTRICT && (
        <button
          onClick={() => {
            setEditingMember(null);
            setFormData({ 
              name: '', 
              phone: '', 
              role: UserRole.MEMBER,
              // If Admin, default to currently viewed tab. If User, default to their category.
              category: activeCategory 
            });
            setIsModalOpen(true);
          }}
          className={`fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg active:scale-90 transition-transform z-20 ${theme.button}`}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingMember ? 'Edit Member' : 'Add New Member'}
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

              {/* Category Dropdown - Only visible to Admins. Users are forced to their category. */}
              {isAdmin ? (
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
              ) : (
                // Visual Confirmation for User
                <div className={`p-3 rounded-lg border ${theme.bgSoft} ${theme.border} text-xs text-gray-600`}>
                  Adding to <span className="font-bold">{activeCategory}</span> list.
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.MEMBER})}
                    className={`flex-1 py-2 rounded-lg text-sm border ${formData.role === UserRole.MEMBER ? `${theme.bgSoft} ${theme.textMain} border-current` : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.CAPTAIN})}
                    className={`flex-1 py-2 rounded-lg text-sm border ${formData.role === UserRole.CAPTAIN ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    Captain
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className={`flex-1 ${theme.button}`}>
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
