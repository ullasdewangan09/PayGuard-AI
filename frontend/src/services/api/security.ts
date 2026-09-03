import { apiClient } from '../api';

export interface SecurityStatus {
  two_factor_enabled: boolean;
}

export interface Setup2FAResponse {
  message: string;
  mock_code: string; // Only for demonstration
}

export interface Verify2FAResponse {
  message: string;
  two_factor_enabled: boolean;
}

export const securityService = {
  /**
   * Get the current user's security status
   */
  getStatus: async (): Promise<SecurityStatus> => {
    const response = await apiClient.get('/security/status');
    return response.data;
  },

  /**
   * Request an OTP to begin setting up 2FA
   */
  setup2FA: async (): Promise<Setup2FAResponse> => {
    const response = await apiClient.post('/security/2fa/setup');
    return response.data;
  },

  /**
   * Verify the 2FA setup OTP
   */
  verify2FA: async (code: string): Promise<Verify2FAResponse> => {
    const response = await apiClient.post('/security/2fa/verify', { code });
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (): Promise<Verify2FAResponse> => {
    const response = await apiClient.post('/security/2fa/disable');
    return response.data;
  },
};
