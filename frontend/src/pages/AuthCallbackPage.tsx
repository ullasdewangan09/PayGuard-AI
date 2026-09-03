import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/supabase';
import { Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { syncUser } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setMessage('Verifying your identity...');
        
        const { user } = await getCurrentUser();
        if (!user) {
          setError('Authentication failed: user not found');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setMessage('Synchronizing with PayGuard...');

        // Extract provider info
        const provider = user.app_metadata?.provider || 'supabase';
        const subject = user.id;

        // Sync with backend
        const syncedUser = await syncUser(
          `supabase:${provider}`,
          subject,
          user.email,
          user.user_metadata?.name,
          user.phone
        );

        if (syncedUser) {
          setMessage('Welcome to PayGuard! Redirecting...');
          setTimeout(() => navigate('/app'), 1500);
        } else {
          setError('Failed to sync user data with PayGuard');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err: any) {
        setError(err.message || 'Authentication callback failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, syncUser]);

  return (
    <div className="min-h-screen bg-app-primary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 rounded-lg border border-[#F2EFE9]/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF2A4D] to-transparent" />
          
          <div className="flex justify-center mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="p-4 bg-app-card rounded-full border border-[#FF2A4D]/20 text-app-red"
            >
              <Shield size={32} />
            </motion.div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="font-editorial text-3xl font-bold text-app-textPrimary mb-2">PayGuard</h1>
            <p className="text-app-textMuted text-sm font-sans">AI Payment Authorization</p>
          </div>

          {error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="p-4 bg-app-red/10 border border-[#FF2A4D]/20 rounded text-app-red text-sm font-mono text-center">
                {error}
              </div>
              <p className="text-app-textMuted text-xs text-center">Redirecting to login...</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} color="#FF2A4D" />
                <p className="text-app-textPrimary text-sm font-mono">{message}</p>
              </div>
              <p className="text-app-textMuted text-xs text-center">This should only take a moment</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
