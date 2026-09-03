import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface NavigationProps {
  activeSection: string;
}

export const Navigation: React.FC<NavigationProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'SYSTEM', href: '#architecture' },
    { label: 'SECURITY', href: '#attack-lab' },
    { label: 'PROOF', href: '#security-proof' },
    { label: 'ABOUT', href: '#razorpay' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        padding: isScrolled ? '20px 24px' : '32px 40px',
        background: isScrolled ? 'rgba(18, 17, 16, 0.8)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(242, 239, 233, 0.05)' : '1px solid transparent'
      }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center relative group">
          <img src="/logo.png" alt="PayGuard Logo" className="w-16 h-16 object-contain" style={{ filter: 'invert(1) grayscale(100%) contrast(500%) brightness(1.2)', mixBlendMode: 'screen' }} />
          <span className="-ml-2 tracking-tight text-4xl text-app-textPrimary" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>
            PayGuard
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-12 font-mono text-[11px] tracking-widest text-app-textMuted uppercase">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href}
              className="hover:text-app-textPrimary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-px after:bg-app-red after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action */}
        <div className="hidden md:block">
          <Link
            to="/app"
            className="font-mono text-[11px] tracking-widest font-bold text-[#121110] bg-[#F2EFE9] px-6 py-3 rounded-sm hover:bg-[#A3A09A] transition-colors"
          >
            ENTER APP
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 z-50"
        >
          <span className={`block w-6 h-[1.5px] bg-[#F2EFE9] transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-[7.5px]' : ''}`} />
          <span className={`block w-6 h-[1.5px] bg-[#F2EFE9] transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-[1.5px] bg-[#F2EFE9] transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-[7.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-app-card border-b border-[#232220] py-8 px-6 md:hidden flex flex-col gap-8 shadow-2xl"
          >
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-editorial text-3xl font-bold text-app-textPrimary"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 inline-block text-center font-mono text-[11px] tracking-widest font-bold text-[#121110] bg-[#F2EFE9] px-6 py-4 rounded-sm"
            >
              ENTER APP
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
