/**
 * BeamSearch — a search input wrapped in a BorderBeam animated ring.
 * Use this everywhere you need a search input.
 */
import React from 'react';
import { Search } from 'lucide-react';
import { BorderBeam } from './border-beam-search';

interface BeamSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const BeamSearch: React.FC<BeamSearchProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
}) => {
  return (
    <BorderBeam size="line" colorVariant="colorful" duration={3.1} borderRadius={9999}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: '#1A1918',
          borderRadius: 9999,
          padding: '0 12px',
          gap: 8,
          height: 38,
          minWidth: 220,
        }}
        className={className}
      >
        <Search size={15} style={{ opacity: 0.4, flexShrink: 0, color: '#A3A09A' }} />
        <input
          type="text"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#F2EFE9',
            fontFamily: "'JetBrains Mono', monospace",
            width: '100%',
          }}
        />
      </div>
    </BorderBeam>
  );
};

/**
 * BeamLoader — a full-page loading screen with a BorderBeam animated shield logo.
 * Replaces plain spinner loading screens.
 */
export const BeamLoader: React.FC<{ message?: string }> = ({
  message = 'Loading PayGuard...',
}) => {
  return (
    <div className="min-h-screen bg-app-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <BorderBeam size="line" colorVariant="colorful" duration={2.4} borderRadius={20}>
          <div
            style={{
              width: 80,
              height: 80,
              background: '#1A1918',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* PayGuard shield SVG */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF2A4D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.9 }}
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </BorderBeam>
        <p
          style={{
            color: '#A3A09A',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            letterSpacing: '0.05em',
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};
