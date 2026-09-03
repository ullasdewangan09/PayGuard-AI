import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Shield, Camera, Loader2, Save, MessageCircle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService, UserProfile, ProfileUpdateData } from '../services/api/profile';
import { supabase } from '../services/supabase';

export const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<ProfileUpdateData>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({
        display_name: data.display_name,
        phone_number: data.phone_number,
        whatsapp_number: data.whatsapp_number,
        email_enabled: data.email_enabled,
        sms_enabled: data.sms_enabled,
        whatsapp_enabled: data.whatsapp_enabled,
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const updated = await profileService.updateProfile(formData);
      setProfile(updated);
      await refreshProfile();
      setSuccess('Profile updated successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.detail || 'Failed to save profile updates.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError(null);

      // Convert image to Base64 string directly
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64String = reader.result as string;
          
          // Update profile with the base64 data URL
          const updated = await profileService.updateProfile({ avatar_url: base64String });
          setProfile(updated);
          await refreshProfile();
          setSuccess('Avatar updated successfully.');
        } catch (err: any) {
          console.error('Error saving avatar to backend:', err);
          setError(err.response?.data?.detail || 'Failed to save avatar.');
        } finally {
          setIsUploadingAvatar(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
        setIsUploadingAvatar(false);
      };

    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload image.');
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-app-red animate-spin" />
      </div>
    );
  }

  const rawName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-editorial font-bold text-app-textPrimary tracking-tight">Profile Settings</h1>
        <p className="text-app-textMuted mt-2 font-mono text-sm">Manage your personal information and preferences.</p>
      </div>

      {error && (
        <div className="bg-app-red/10 border border-[#FF2A4D]/20 text-app-red px-4 py-3 rounded-lg flex items-start gap-3">
          <Shield className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-app-green/10 border border-[#00E599]/20 text-app-green px-4 py-3 rounded-lg flex items-start gap-3">
          <Shield className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6 flex flex-col items-center text-center">
            
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full bg-[#121110] shadow-inner flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-app-textPrimary">{initials}</span>
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-app-textPrimary animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-app-textPrimary mb-1" />
                    <span className="text-[10px] text-app-textPrimary font-medium uppercase tracking-wider">Change</span>
                  </>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <h3 className="text-lg font-bold text-app-textPrimary">{displayName}</h3>
            <p className="text-sm text-app-textMuted font-mono break-all">{user?.email}</p>
            
            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono bg-[#121110] p-3 rounded-lg shadow-inner">
                <span className="text-app-textMuted">ID</span>
                <span className="text-app-textPrimary truncate max-w-[120px]">{user?.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono bg-[#121110] p-3 rounded-lg shadow-inner">
                <span className="text-app-textMuted">Joined</span>
                <span className="text-app-textPrimary">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-app-textPrimary mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-app-red" />
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-app-textMuted uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#121110] rounded-lg px-4 py-3 text-app-textPrimary placeholder:text-app-textMuted focus:outline-none focus:ring-2 focus:ring-[#FF2A4D]/50 transition-colors shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-app-textMuted uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-textMuted" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-[#1A1918] rounded-lg pl-10 pr-4 py-3 text-app-textMuted cursor-not-allowed shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-app-textMuted mt-1">Email cannot be changed directly for security reasons. Please contact support.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-app-textMuted uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-textMuted" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#121110] rounded-lg pl-10 pr-4 py-3 text-app-textPrimary placeholder:text-app-textMuted focus:outline-none focus:ring-2 focus:ring-[#FF2A4D]/50 transition-colors shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-app-textPrimary mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-app-red" />
              Notification Preferences
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[#121110] rounded-xl cursor-pointer hover:bg-[#1f1e1d] transition-colors shadow-inner">
                <div>
                  <p className="text-sm font-bold text-app-textPrimary">Email Notifications</p>
                  <p className="text-xs text-app-textMuted">Receive critical alerts and receipts via email</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="email_enabled" checked={formData.email_enabled || false} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2A2928] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-app-green"></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-[#121110] rounded-xl cursor-pointer hover:bg-[#1f1e1d] transition-colors shadow-inner">
                <div>
                  <p className="text-sm font-bold text-app-textPrimary">SMS Alerts</p>
                  <p className="text-xs text-app-textMuted">Get instant SMS for high-risk blocks</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="sms_enabled" checked={formData.sms_enabled || false} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2A2928] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-app-green"></div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#FF2A4D] hover:bg-[#ff3b5c] text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,42,77,0.4)]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};
