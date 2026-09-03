import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  getCurrentUser
} from '../services/supabase';
import { Mail, Loader2, Shield, ChevronLeftIcon, AtSignIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type AuthStep = 'methods' | 'email-input' | 'email-verify';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { syncUser, isAuthenticated } = useAuth();
  const [step, setStep] = useState<AuthStep>('methods');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  const handlePostAuthSync = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        setError('Authentication failed: no user');
        return;
      }
      const provider = user.app_metadata?.provider || 'supabase';
      const syncedUser = await syncUser(
        `supabase:${provider}`,
        user.id,
        user.email,
        user.user_metadata?.name,
        user.phone
      );
      if (syncedUser) {
        navigate('/app');
      }
    } catch (err: any) {
      setError(`Post-auth sync failed: ${err.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    try {
      setError('');
      setEmailLoading(true);
      let resError, data;
      if (isSignUp) {
        const res = await signUpWithEmailPassword(email, password);
        resError = res.error;
        data = res.data;
      } else {
        const res = await signInWithEmailPassword(email, password);
        resError = res.error;
        data = res.data;
      }
      
      if (resError) {
        setError(resError.message);
        return;
      }
      if (isSignUp && data?.user && !data.session) {
        setStep('email-verify');
        return;
      }
      await handlePostAuthSync();
      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-app-primary text-app-textPrimary flex">
      {/* Left Pane */}
      <div className="hidden lg:flex lg:w-1/2 bg-app-card flex-col justify-between p-12 border-r border-[#F2EFE9]/10 relative overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 mix-blend-screen"
        >
          <source src="/12354535_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-transparent to-transparent z-0 pointer-events-none" />
        
        <div className="z-10 flex items-center text-app-red">
          <img src="/logo.png" alt="PayGuard Logo" className="w-24 h-24 object-contain" style={{ filter: 'invert(1) grayscale(100%) contrast(500%) brightness(1.2)', mixBlendMode: 'screen' }} />
          <p className="-ml-4 text-5xl text-app-textPrimary tracking-tight" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>PayGuard</p>
        </div>
        
        <div className="z-10 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-2xl font-editorial text-app-textPrimary/90 leading-relaxed max-w-lg">
              &ldquo;PayGuard's AI intent validation has reduced our unauthorized transactions to zero while perfectly integrating into our existing approval flow.&rdquo;
            </p>
            <footer className="font-mono text-sm text-app-red">
              ~ Financial Ops Team
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Pane */}
      <div className="relative flex w-full lg:w-1/2 flex-col justify-center p-6 sm:p-12 z-10 bg-app-primary">
        <Button variant="ghost" className="absolute top-6 left-6 text-app-textMuted hover:text-app-textPrimary hover:bg-app-card" asChild>
          <Link to="/">
            <ChevronLeftIcon className='size-4 mr-2' />
            Home
          </Link>
        </Button>
        
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex items-center lg:hidden text-app-red justify-center mb-12">
            <img src="/logo.png" alt="PayGuard Logo" className="w-24 h-24 object-contain" style={{ filter: 'invert(1) grayscale(100%) contrast(500%) brightness(1.2)', mixBlendMode: 'screen' }} />
            <p className="-ml-4 text-5xl text-app-textPrimary tracking-tight" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>PayGuard</p>
          </div>
          
          <div className="flex flex-col space-y-4 text-center lg:text-left mb-4">
            <h1 className="font-editorial text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-app-textPrimary via-[#F2EFE9] to-[#8C8A85] pb-1">
              {step === 'email-verify' ? 'Check your email' : 'Sign In or Join Now'}
            </h1>
            <p className="text-app-textMuted text-base font-sans font-light leading-relaxed max-w-sm mx-auto lg:mx-0">
              {step === 'email-verify' 
                ? "We've sent a verification link to your email." 
                : "Secure your financial operations with PayGuard."}
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-app-red/10 border border-[#FF2A4D]/20 rounded-lg text-app-red text-sm font-mono text-center">
              {error}
            </motion.div>
          )}

          <div className="relative">
            <AnimatePresence mode="wait">
              {step === 'methods' && (
                <motion.div key="methods" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <Button type="button" size="lg" className="w-full bg-[#F2EFE9] text-[#121110] hover:bg-white h-12 text-base font-semibold" onClick={handleGoogleSignIn} disabled={loading}>
                    {loading ? <Loader2 className="size-5 mr-2 animate-spin" /> : <GoogleIcon className='size-5 mr-2' />}
                    Continue with Google
                  </Button>

                  <div className="flex w-full items-center justify-center my-6">
                    <div className="bg-[#F2EFE9]/10 h-px w-full" />
                    <span className="text-app-textMuted px-4 text-xs font-mono uppercase">or</span>
                    <div className="bg-[#F2EFE9]/10 h-px w-full" />
                  </div>

                  <Button type="button" variant="outline" size="lg" className="w-full h-12 bg-transparent border-[#F2EFE9]/20 hover:bg-app-card text-app-textPrimary" onClick={() => { setStep('email-input'); setError(''); }}>
                    <Mail className='size-5 mr-2 text-app-textMuted' />
                    Continue with Email
                  </Button>
                </motion.div>
              )}

              {step === 'email-input' && (
                <motion.form key="email-input" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        placeholder="you@example.com"
                        className="peer pl-10 h-12 bg-app-card border-[#F2EFE9]/20 focus-visible:ring-[#FF2A4D] focus-visible:border-[#FF2A4D] text-app-textPrimary placeholder:text-app-textMuted"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-app-textMuted peer-focus:text-app-red transition-colors">
                        <AtSignIcon className="size-4" />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        className="pl-4 h-12 bg-app-card border-[#F2EFE9]/20 focus-visible:ring-[#FF2A4D] focus-visible:border-[#FF2A4D] text-app-textPrimary"
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="text-app-textMuted">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-app-red hover:text-app-red/80 font-semibold transition-colors">
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <Button type="submit" disabled={emailLoading || !email || !password} className="w-full bg-app-red text-app-textPrimary hover:bg-app-red/90 h-12 text-base font-semibold">
                      {emailLoading ? <Loader2 className="size-5 mr-2 animate-spin" /> : null}
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>
                    
                    <Button type="button" variant="ghost" className="w-full text-app-textMuted hover:text-app-textPrimary" onClick={() => setStep('methods')}>
                      Back to options
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === 'email-verify' && (
                <motion.div key="email-verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="text-center space-y-6 pt-6">
                  <div className="w-16 h-16 bg-app-red/10 rounded-full flex items-center justify-center mx-auto border border-[#FF2A4D]/20 text-app-red">
                    <Mail size={32} />
                  </div>
                  <p className="text-app-textMuted text-sm">
                    We've sent an account confirmation link to <span className="text-app-textPrimary font-mono">{email}</span>.
                    <br /><br />Please click the link in that email to activate your account, then you can sign in!
                  </p>
                  <Button type="button" variant="outline" className="w-full h-12 bg-transparent border-[#F2EFE9]/20 hover:bg-app-card text-app-textPrimary" onClick={() => {
                    setStep('methods'); setEmail(''); setPassword(''); setError(''); setIsSignUp(false);
                  }}>
                    Back to Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-app-textMuted pt-10 text-xs text-center leading-relaxed">
            By clicking continue, you agree to our{' '}
            <a href="#" className="text-app-textMuted hover:text-app-red underline underline-offset-4 transition-colors duration-200">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-app-textMuted hover:text-app-red underline underline-offset-4 transition-colors duration-200">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </main>
  );
};

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);
