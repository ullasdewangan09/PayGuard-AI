import { apiClient } from '../api';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  whatsapp_number: string | null;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  display_name?: string | null;
  phone_number?: string | null;
  avatar_url?: string | null;
  whatsapp_number?: string | null;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  whatsapp_enabled?: boolean;
}

export const profileService = {
  /**
   * Fetch the current authenticated user's profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/profile/');
    return response.data;
  },

  /**
   * Update the current authenticated user's profile
   */
  updateProfile: async (data: ProfileUpdateData): Promise<UserProfile> => {
    const response = await apiClient.put('/profile/', data);
    return response.data;
  },
};
