
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { UserCircle, MapPin, Phone, LogOut, Camera, Edit2, Check, X } from 'lucide-react';
import { updateUserProfile } from '../services/storageService';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [previewImage, setPreviewImage] = useState<string | undefined>(user.photoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit image size to ~2MB to prevent localStorage issues
      if (file.size > 2000000) {
        alert("Image is too large. Please choose an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      name: name,
      photoUrl: previewImage
    };
    
    // Save to storage
    updateUserProfile(updatedUser);
    
    // Update App state
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user.name);
    setPreviewImage(user.photoUrl);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pt-4 animate-pop">
      <div className="flex flex-col items-center relative">
        <div className="relative group">
          <div className="w-28 h-28 bg-mint-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-20 h-20 text-mint-600 opacity-50" />
            )}
          </div>
          
          {isEditing && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-gray-900 text-white p-2 rounded-full shadow-md hover:bg-gray-800 transition-colors"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {isEditing ? (
          <div className="mt-4 w-full max-w-xs space-y-2">
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="text-center font-bold text-lg"
              placeholder="Enter User Name"
            />
            <div className="flex gap-2 justify-center mt-2">
              <Button onClick={handleSave} className="!py-1 !px-3 text-sm">
                <Check className="w-4 h-4" /> Save
              </Button>
              <Button variant="secondary" onClick={handleCancel} className="!py-1 !px-3 text-sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center relative">
             <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-mint-600 hover:bg-mint-50 rounded-full transition-colors"
                title="Edit Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
             </div>
             <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
              user.role === UserRole.MASTER ? 'bg-orange-100 text-orange-700' : 
              user.role === UserRole.CAPTAIN ? 'bg-indigo-100 text-indigo-700' : 
              'bg-gray-100 text-gray-600'
            }`}>
              {user.role}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <Phone className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase">Phone Number</p>
            <p className="text-gray-800 font-medium">{user.phone}</p>
          </div>
        </div>
        
        <div className="p-4 flex items-center gap-4">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase">District</p>
            <p className="text-gray-800 font-medium">{user.district}</p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button 
          variant="danger" 
          onClick={onLogout} 
          className="w-full flex items-center justify-center gap-2 py-3"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
