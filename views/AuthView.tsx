
import React, { useState } from 'react';
import { UserRole, User, UserCategory } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { MASTER_PHONES, MASTER_SECRET_CODE, STATE_HEAD_CREDENTIALS, TN_DISTRICTS } from '../constants';
import { findUserByPhone, registerUser, getMasterObtMembers } from '../services/storageService';
import { UserPlus, MessageSquareCode, Lock } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState(TN_DISTRICTS[0]);
  const [category, setCategory] = useState<UserCategory>(UserCategory.COLLEGE_BOYS);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Master Mode Toggle
  const [isMasterMode, setIsMasterMode] = useState(false);

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleSignupRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\s/g, '').trim();

    if (!cleanPhone || !password || !name) {
      setError('Please fill in all fields.');
      return;
    }

    // Check if phone belongs to Master List (Static or Dynamic)
    const masterMembers = getMasterObtMembers();
    const isMasterNumber = MASTER_PHONES.includes(cleanPhone) || masterMembers.some(m => m.phone === cleanPhone);

    if (isMasterNumber) {
      setError('This number is authorized for Master Admin access. Please Login directly.');
      setIsLogin(true);
      return;
    }

    const existing = findUserByPhone(cleanPhone);
    if (existing) {
      setError('User with this OBT number already exists.');
      return;
    }

    const mockOtp = '1234'; 
    setGeneratedOtp(mockOtp);
    setShowOtpModal(true);
  };

  const verifyOtpAndRegister = () => {
    if (otpValue !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    const cleanPhone = phone.replace(/\s/g, '').trim();

    const newUser: User = {
      id: Date.now().toString(),
      name,
      phone: cleanPhone,
      district,
      role: UserRole.MEMBER,
      category: category,
      password,
      isApproved: false
    };
    
    registerUser(newUser);
    
    setShowOtpModal(false);
    setOtpValue('');
    setSuccessMsg('Registration Successful! Account pending approval.');
    setIsLogin(true); 
    setPhone('');
    setPassword('');
    setName('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = phone.replace(/\s/g, '').trim();

    // 1. Check for Master Access (Static List OR Dynamic Master OBT Team)
    const masterMembers = getMasterObtMembers();
    const dynamicMaster = masterMembers.find(m => m.phone === cleanPhone);
    const isMasterNumber = MASTER_PHONES.includes(cleanPhone) || !!dynamicMaster;

    if (isMasterNumber) {
      if (password === MASTER_SECRET_CODE || password === cleanPhone) {
        onLogin({
          id: `master-${cleanPhone}`,
          name: dynamicMaster ? dynamicMaster.name : 'Master Admin',
          phone: cleanPhone,
          district: 'All',
          role: UserRole.MASTER,
          category: UserCategory.COLLEGE_BOYS, // Default view
          isApproved: true
        });
        return;
      } else {
        setError('Invalid Secret Code.');
        return;
      }
    }

    // 2. State Head Check
    if (cleanPhone === STATE_HEAD_CREDENTIALS.phone && password === STATE_HEAD_CREDENTIALS.password) {
      onLogin({
        id: 'state-head',
        name: 'State OBT Head',
        phone: cleanPhone,
        district: 'State Level',
        role: UserRole.STATE_HEAD,
        category: UserCategory.COLLEGE_BOYS,
        isApproved: true
      });
      return;
    }

    // 3. Regular User Check
    const user = findUserByPhone(cleanPhone);
    
    if (!user) {
      setError('User not found. Please Sign Up.');
      return;
    }

    if (user.password !== password) {
      setError('Invalid password.');
      return;
    }

    if (!user.isApproved) {
      setError('Account pending Admin approval.');
      return;
    }

    onLogin(user);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0fdfa] p-4 relative font-sans">
      
      {/* OTP Modal */}
      {showOtpModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs animate-pop">
            <div className="flex justify-center mb-4">
              <div className="bg-mint-100 p-3 rounded-full text-mint-600">
                <MessageSquareCode className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Verify Phone</h3>
            <p className="text-xs text-center text-gray-500 mb-6">
              Code sent to <span className="font-bold">{phone}</span>
              <br/>(Demo code: 1234)
            </p>
            <Input 
              placeholder="Enter OTP" 
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={4}
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={verifyOtpAndRegister} className="w-full">Verify</Button>
              <button onClick={() => setShowOtpModal(false)} className="text-gray-400 text-xs py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Card - Matches the 'white card with rounded corners' look */}
      <div className="w-full max-w-[22rem] bg-white rounded-[24px] shadow-xl p-8 border border-gray-50 animate-pop relative">
        
        {/* Master Mode Indicator */}
        {isMasterMode && isLogin && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-t-[24px]"></div>
        )}

        {/* Logo Section */}
        <div className="flex justify-center mb-10 mt-2">
          <Logo />
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs font-medium text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={isLogin ? handleLoginSubmit : handleSignupRequest} className="space-y-6">
          {!isLogin && (
            <>
              <Input 
                label="Full Name" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Category</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0d9488] transition-all text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as UserCategory)}
                >
                  {Object.values(UserCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">District</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0d9488] transition-all text-sm"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  {TN_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div className="space-y-1.5">
            <Input 
              label="OBT Number" 
              placeholder="Ex: 9876543210"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="!py-3.5 !rounded-xl placeholder:text-gray-400 font-medium border-gray-200 focus:border-[#0d9488]"
            />
          </div>
          
          <div className="space-y-1.5">
            <Input 
              label={isMasterMode ? "Secret Code" : "Password"}
              placeholder="••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="!py-3.5 !rounded-xl placeholder:text-gray-400 font-bold tracking-widest border-gray-200 focus:border-[#0d9488]"
            />
          </div>

          {error && !showOtpModal && (
            <p className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>
          )}

          <div className="pt-2">
            <Button 
              type="submit" 
              className={`w-full !py-3.5 !rounded-xl text-white font-bold text-base shadow-lg transition-all active:scale-[0.98] ${
                isMasterMode 
                  ? 'bg-gray-800 hover:bg-black shadow-gray-200' 
                  : 'bg-[#0f766e] hover:bg-[#115e59] shadow-teal-100' // Dark Teal button
              }`}
            >
              {isLogin ? (isMasterMode ? 'Access System' : 'Login') : 'Verify & Register'}
            </Button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setIsMasterMode(false);
              setError('');
              setSuccessMsg('');
              setPhone('');
              setPassword('');
            }}
            className="text-[#0f766e] font-bold hover:text-[#115e59] flex items-center gap-2 text-sm"
          >
            {isLogin ? (
               <>
                 <UserPlus className="w-4 h-4" /> New member? Register
               </>
            ) : "Already have an account? Login"}
          </button>
          
          {/* Subtle Master Login Toggle */}
          {isLogin && (
            <button 
              onClick={() => setIsMasterMode(!isMasterMode)}
              className="text-[10px] text-gray-300 hover:text-gray-500 flex items-center gap-1 transition-colors"
            >
              <Lock className="w-3 h-3" /> {isMasterMode ? 'Back to User Login' : 'Master Access'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
