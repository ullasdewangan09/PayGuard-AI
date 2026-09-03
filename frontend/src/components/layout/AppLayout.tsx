import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BrainCircuit, ListChecks, ArrowLeftRight, Banknote, ReceiptText,
  ShieldCheck, FlaskConical, BarChart3, ScrollText, Bell, SlidersHorizontal,
  ExternalLink, LogOut, Loader2, User, Lock, ChevronRight, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_CATEGORIES = [
  {
    title: 'OVERVIEW',
    collapsible: false,
    items: [
      { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    ]
  },
  {
    title: 'CONTROL',
    collapsible: true,
    accent: '#FF2A4D',
    items: [
      { name: 'AI Intent', path: '/app/ai-intent', icon: BrainCircuit },
      { name: 'Intent Rules', path: '/app/intents', icon: ListChecks },
      { name: 'Transactions', path: '/app/transactions', icon: ArrowLeftRight },
      { name: 'Payments', path: '/app/payments', icon: Banknote },
      { name: 'Receipts', path: '/app/receipts', icon: ReceiptText },
    ]
  },
  {
    title: 'SECURITY',
    collapsible: true,
    accent: '#FF9500',
    items: [
      { name: 'Security Center', path: '/app/security', icon: ShieldCheck },
      { name: 'Attack Lab', path: '/app/attack-lab', icon: FlaskConical },
      { name: 'Evaluation', path: '/app/evaluation', icon: BarChart3 },
      { name: 'Audit Trail', path: '/app/audit', icon: ScrollText },
    ]
  },
  {
    title: 'SYSTEM',
    collapsible: true,
    accent: '#A78BFA',
    items: [
      { name: 'Notifications', path: '/app/notifications', icon: Bell },
      { name: 'Settings', path: '/app/settings', icon: SlidersHorizontal },
    ]
  }
];

// Accent colors per category (for the section badge)
const CATEGORY_ACCENT: Record<string, string> = {
  CONTROL: '#FF2A4D',
  SECURITY: '#FF9500',
  SYSTEM: '#A78BFA',
};

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isExpanded = true;

  // Track which collapsible sections are open (default: all open)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    CONTROL: true,
    SECURITY: true,
    SYSTEM: true,
  });

  // Sidebar resize state
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 240;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault(); // Prevent text selection during drag
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 220) newWidth = 220; // Minimum width
      if (newWidth > 450) newWidth = 450; // Maximum width
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem('sidebarWidth', sidebarWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const displayEmail = userProfile?.email || user?.email || 'admin@payguard.ai';
  const rawName = userProfile?.display_name || userProfile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'Admin User';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSection = (title: string) => {
    if (!isExpanded) return; // sections only collapsible when sidebar is open
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Count active items per section for badge
  const getActiveBadge = (items: typeof NAV_CATEGORIES[0]['items']) =>
    items.some(i => location.pathname === i.path);

  return (
    <div
      className="flex h-screen font-sans overflow-hidden bg-transparent"
      style={{ color: 'var(--text-primary)' }}
    >
      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        className={`sidebar-nav relative flex flex-col justify-between overflow-y-auto overflow-x-hidden z-20 shrink-0 backdrop-blur-2xl ${
          isResizing ? 'select-none pointer-events-none' : ''
        }`}
        style={{
          width: `${sidebarWidth}px`,
          background: 'rgba(10, 10, 10, 0.45)',
          transition: isResizing ? 'none' : 'width 0.3s ease-in-out',
        }}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-white/10 pointer-events-auto"
          style={{ background: isResizing ? 'rgba(255,255,255,0.1)' : 'transparent' }}
        />

        <div className="flex flex-col">
          {/* Logo */}
          <div
            className="h-20 flex items-center px-4 sticky top-0 z-10 overflow-hidden shrink-0"
            style={{ background: 'transparent' }}
          >
            <Link to="/" className="flex items-center gap-1.5 group shrink-0 w-full min-w-0">
              <img src="/logo.png" alt="PayGuard Logo" className="w-12 h-12 object-contain shrink-0" style={{ filter: 'invert(1) grayscale(100%) contrast(500%) brightness(1.2)', mixBlendMode: 'screen' }} />
              <span
                className="tracking-tight text-3xl whitespace-nowrap truncate transition-all duration-300"
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                  color: '#F2EFE9',
                }}
              >
                PayGuard
              </span>
            </Link>
          </div>

          {/* Nav sections */}
          <div className="py-3 space-y-1 px-2">
            {NAV_CATEGORIES.map((category) => {
              const isOpen = !category.collapsible || openSections[category.title];
              const accent = CATEGORY_ACCENT[category.title];
              const hasActive = getActiveBadge(category.items);

              return (
                <div key={category.title} className="mb-1">
                  {/* Section header — clickable to collapse when sidebar is expanded */}
                  {category.collapsible ? (
                    <button
                      onClick={() => toggleSection(category.title)}
                      className="w-full flex items-center px-2.5 h-9 mt-1 rounded-lg transition-colors duration-200 group relative"
                      style={{ cursor: isExpanded ? 'pointer' : 'default' }}
                    >
                      <div 
                        className="flex items-center gap-3 w-full transition-opacity duration-300"
                        style={{ opacity: isExpanded ? 1 : 0 }}
                      >
                        {/* Colored dot indicator */}
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                            style={{
                              background: hasActive ? accent : 'var(--text-muted)',
                              boxShadow: hasActive ? `0 0 6px ${accent}80` : 'none',
                            }}
                          />
                        </div>
                        <span
                          className="text-[9px] font-sans font-bold tracking-[0.18em] uppercase whitespace-nowrap flex-1 text-left"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {category.title}
                        </span>
                        <ChevronDown
                          size={12}
                          className="shrink-0 transition-transform duration-300"
                          style={{
                            color: 'var(--text-muted)',
                            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                          }}
                        />
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center px-2.5 h-9 mt-1 relative">
                      <div 
                        className="flex items-center gap-3 w-full transition-opacity duration-300"
                        style={{ opacity: isExpanded ? 1 : 0 }}
                      >
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--text-muted)' }}
                          />
                        </div>
                        <span
                          className="text-[9px] font-sans font-bold tracking-[0.18em] uppercase whitespace-nowrap"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {category.title}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div
                    className="sidebar-group-content space-y-0.5"
                    style={{
                      maxHeight: isOpen ? `${category.items.length * 56}px` : '0px',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      const itemAccent = accent || '#FF2A4D';

                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          title={!isExpanded ? item.name : undefined}
                          className="relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-200 overflow-hidden group"
                          style={{
                            background: isActive ? `${itemAccent}14` : 'transparent',
                            color: isActive ? itemAccent : 'var(--text-secondary)',
                          }}
                          onMouseEnter={e => {
                            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover-bg)';
                            if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={e => {
                            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                            if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                          }}
                        >
                          {/* Active bar */}
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                              style={{ background: itemAccent }}
                            />
                          )}

                          {/* Icon with subtle glow when active */}
                          <span
                            className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200"
                            style={isActive ? { background: `${itemAccent}20` } : {}}
                          >
                            <Icon size={15} strokeWidth={isActive ? 2.3 : 1.8} />
                          </span>

                          <span
                            className="font-sans text-sm font-medium whitespace-nowrap transition-all duration-300"
                            style={{
                              opacity: isExpanded ? 1 : 0,
                              transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                            }}
                          >
                            {item.name}
                          </span>

                          {/* "Active" pill — only when expanded */}
                          {isActive && isExpanded && (
                            <span
                              className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ background: `${itemAccent}20`, color: itemAccent }}
                            >
                              •
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Divider between categories */}
                  {category.collapsible && (
                    <div 
                      className="mx-3 mt-2 mb-1 h-px transition-opacity duration-300" 
                      style={{ 
                        background: 'transparent',
                        opacity: isExpanded ? 1 : 0 
                      }} 
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - Back to Site */}
        <div
          className="p-2 sticky bottom-0 z-30"
          style={{ background: 'transparent' }}
        >
          {/* Back to Site */}
          <Link
            to="/"
            title={!isExpanded ? 'Back to Site' : undefined}
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all overflow-hidden"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <ExternalLink size={14} className="shrink-0" />
            <span
              className="font-sans text-xs font-medium whitespace-nowrap transition-all duration-300"
              style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)' }}
            >
              Back to Site
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto relative min-w-0 bg-transparent flex flex-col"
      >
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-20" />
        
        {/* Top Header */}
        <header className="relative z-30 flex justify-end items-center px-8 py-4 bg-transparent shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all text-left overflow-hidden bg-[#1A1918] border border-white/5 hover:border-white/10 shadow-sm"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,42,77,0.3), var(--bg-tertiary))',
                  borderColor: 'transparent',
                  color: 'var(--text-primary)',
                }}
              >
                {userProfile?.avatar_url
                  ? <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold truncate leading-tight text-white">{displayName}</p>
                <p className="text-[10px] truncate leading-tight text-[#A3A09A]">{displayEmail}</p>
              </div>
              <ChevronDown
                size={14}
                className={`hidden sm:block shrink-0 transition-transform duration-200 ml-1 ${isMenuOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            {/* User Menu Dropdown */}
            {isMenuOpen && (
              <div
                className="absolute top-full mt-2 right-0 w-56 rounded-xl shadow-2xl p-1.5 z-50 animate-in slide-in-from-top-2 duration-200"
                style={{
                  background: 'var(--bg-secondary)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div className="space-y-0.5">
                  <Link to="/app/profile" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[#A3A09A] hover:bg-[#1A1918] hover:text-white"
                  >
                    <User size={15} /> <span>Profile</span>
                  </Link>
                  <Link to="/app/profile/security" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[#A3A09A] hover:bg-[#1A1918] hover:text-white"
                  >
                    <Lock size={15} /> <span>Security</span>
                  </Link>
                  <Link to="/app/settings" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[#A3A09A] hover:bg-[#1A1918] hover:text-white"
                  >
                    <SlidersHorizontal size={15} /> <span>Settings</span>
                  </Link>
                  <div className="my-1 border-t border-white/5" />
                  <button onClick={handleLogout} disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[#FF2A4D] hover:bg-[#FF2A4D]/10 disabled:opacity-50"
                  >
                    {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="relative z-10 p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
