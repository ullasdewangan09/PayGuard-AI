import { useState, useEffect } from 'react';

export function useScrollProgress() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(currentScrollY / docHeight, 0), 1) : 0;

      setScrollY(currentScrollY);
      setScrollProgress(progress);

      // Section tracking
      const sections = [
        'hero',
        'narrative',
        'intent',
        'transaction',
        'decision-matrix',
        'rogue-agent',
        'attack-lab',
        'security-proof',
        'audit-trail',
        'architecture',
        'razorpay',
        'engineering',
        'final-cta'
      ];

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY, scrollProgress, activeSection };
}
