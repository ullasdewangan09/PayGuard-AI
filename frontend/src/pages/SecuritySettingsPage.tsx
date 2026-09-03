import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { securityService } from '../services/api/security';

export const SecuritySettingsPage = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Setup state
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [mockCode, setMockCode] = useState(''); // Only for demo
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Status messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      setIsLoading(true);
      const status = await securityService.getStatus();
      setIs2FAEnabled(status.two_factor_enabled);
    } catch (err: any) {
      console.error('Error fetching security status:', err);
      setError('Failed to load security settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiate2FA = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const response = await securityService.setup2FA();
      setIsSettingUp(true);
      
      // For demonstration, we show the mock code
      setMockCode(response.mock_code);
      setSuccess('Verification code sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initiate 2FA setup.');
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      
      const response = await securityService.verify2FA(otpCode);
      setIs2FAEnabled(response.two_factor_enabled);
      setIsSettingUp(false);
      setOtpCode('');
      setMockCode('');
      setSuccess('Two-Factor Authentication successfully enabled!');
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    // In a real app, you would prompt for a password or another OTP here
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication? This severely reduces your account security.')) {
      return;
    }

    try {
      setError(null);
      const response = await securityService.disable2FA();
      setIs2FAEnabled(response.two_factor_enabled);
      setSuccess('Two-Factor Authentication disabled.');
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to disable 2FA.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-app-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-editorial font-bold text-app-textPrimary tracking-tight">Security Center</h1>
        <p className="text-app-textMuted mt-2 font-mono text-sm">Manage multi-factor authentication and account security.</p>
      </div>

      {error && (
        <div className="bg-app-red/10 border border-[#FF2A4D]/20 text-app-red px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-app-green/10 border border-[#00E599]/20 text-app-green px-4 py-3 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Security Status Overview */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6 flex flex-col items-center text-center">
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${is2FAEnabled ? 'bg-app-green/10 border border-[#00E599]/20' : 'bg-app-red/10 border border-[#FF2A4D]/20'}`}>
              <Shield className={`w-10 h-10 ${is2FAEnabled ? 'text-app-green' : 'text-app-red'}`} />
            </div>

            <h3 className="text-lg font-bold text-app-textPrimary">
              {is2FAEnabled ? 'Highly Secure' : 'Vulnerable'}
            </h3>
            <p className="text-xs text-app-textMuted font-mono mt-1">
              {is2FAEnabled 
                ? 'Your account is protected by multi-factor authentication.' 
                : 'Enable 2FA to secure your account from unauthorized access.'}
            </p>
            
          </div>
        </div>

        {/* Right Column: 2FA Settings */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 p-32 bg-app-red/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-app-textPrimary flex items-center gap-2">
                    <Key className="w-5 h-5 text-app-red" />
                    Two-Factor Authentication (2FA)
                  </h2>
                  <p className="text-sm text-app-textMuted mt-1">
                    Adds an extra layer of security to your account. Once enabled, you'll need to enter a verification code sent to your email when modifying sensitive settings or performing high-value transactions.
                  </p>
                </div>
                
                {!isSettingUp && (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-inner ${is2FAEnabled ? 'bg-[#00E599]/10 text-[#00E599]' : 'bg-[#121110] text-app-textMuted'}`}>
                    {is2FAEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                )}
              </div>

              {!is2FAEnabled && !isSettingUp && (
                <div className="pt-4 border-t border-[#2A2928]">
                  <button
                    onClick={handleInitiate2FA}
                    className="flex items-center gap-2 bg-app-red hover:bg-[#E62544] text-app-textPrimary px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    Set up 2FA
                  </button>
                </div>
              )}

              {is2FAEnabled && !isSettingUp && (
                <div className="pt-4 border-t border-[#2A2928]">
                  <button
                    onClick={handleDisable2FA}
                    className="flex items-center gap-2 bg-[#121110] hover:bg-[#1f1e1d] text-app-textPrimary px-6 py-3 rounded-lg font-bold transition-all shadow-inner"
                  >
                    Disable 2FA
                  </button>
                  <p className="text-xs text-app-red font-mono mt-3">
                    Warning: Disabling 2FA will significantly decrease your account security.
                  </p>
                </div>
              )}

              {isSettingUp && (
                <div className="pt-6 border-t border-[#2A2928] animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-[#121110] rounded-xl p-5 mb-6 shadow-inner">
                    <h4 className="text-sm font-bold text-app-textPrimary mb-2">Check your email</h4>
                    <p className="text-xs text-app-textMuted">
                      We've sent a 6-digit verification code to your registered email address. Please enter it below to complete setup.
                    </p>
                    
                    {/* DEMO PURPOSES ONLY */}
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs font-mono">
                      <strong>Demo Mode:</strong> Use code <span className="font-bold text-app-textPrimary tracking-widest">{mockCode}</span> to verify.
                    </div>
                  </div>

                  <form onSubmit={handleVerify2FA} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-app-textMuted uppercase tracking-wider mb-2 block">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full sm:w-48 bg-[#121110] rounded-lg px-4 py-3 text-app-textPrimary text-center tracking-[0.5em] font-mono placeholder:text-app-textMuted focus:outline-none focus:ring-2 focus:ring-[#FF2A4D]/50 transition-colors shadow-inner"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isVerifying || otpCode.length !== 6}
                        className="flex items-center justify-center min-w-[120px] gap-2 bg-app-red hover:bg-[#E62544] text-app-textPrimary px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingUp(false);
                          setOtpCode('');
                          setMockCode('');
                        }}
                        className="px-4 py-3 text-sm font-bold text-app-textMuted hover:text-app-textPrimary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
