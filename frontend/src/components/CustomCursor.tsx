import React from 'react';
import { useCursor } from '../hooks/useCursor';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const CustomCursor: React.FC = () => {
  const cursor = useCursor();
  const prefersReduced = useReducedMotion();

  if (prefersReduced || cursor.cursorVariant === 'hidden') {
    return null;
  }

  // Dynamic cursor colors
  const getCursorColor = () => {
    switch (cursor.cursorVariant) {
      case 'approve':
        return '#10B981'; // emerald-500
      case 'block':
        return '#EF4444'; // rose-500
      case 'ask':
      case 'attack':
        return '#F59E0B'; // amber-500
      case 'inspect':
        return '#2563EB'; // blue-600
      default:
        return '#2563EB'; // blue-600
    }
  };

  const color = getCursorColor();

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[100] transition-opacity duration-300"
      style={{
        transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
        opacity: cursor.x < 0 ? 0 : 1
      }}
    >
      {/* Core Dot */}
      <div
        className="w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 spring-transition"
        style={{
          backgroundColor: color,
          transform: `translate(-50%, -50%) scale(${cursor.isHovering ? 0.3 : 1})`,
          boxShadow: `0 0 12px ${color}`
        }}
      />

      {/* Reactive Ring / Geometry */}
      <div
        className="absolute w-10 h-10 rounded-full border-2 spring-transition pointer-events-none"
        style={{
          borderColor: color,
          transform: `translate(-50%, -50%) scale(${
            cursor.isHovering ? 1.4 : cursor.cursorVariant === 'block' ? 0.6 : 0.8
          }) rotate(${cursor.isHovering ? '45deg' : '0deg'})`,
          borderRadius: cursor.cursorVariant === 'block' ? '20%' : '50%',
          opacity: cursor.isHovering ? 0.6 : 0.2,
          boxShadow: cursor.isHovering ? `inset 0 0 10px ${color}` : 'none'
        }}
      />
      
      {/* Secondary Ring for Approve/Block states */}
      {(cursor.cursorVariant === 'approve' || cursor.cursorVariant === 'block') && (
        <div
          className="absolute w-14 h-14 rounded-full border border-dashed pointer-events-none animate-rotate-slow"
          style={{
            borderColor: color,
            transform: `translate(-50%, -50%)`,
            opacity: 0.3,
          }}
        />
      )}

      {/* Telemetry Badge */}
      {cursor.badgeText && (
        <div
          className="absolute left-6 top-6 px-3 py-1 rounded text-[9px] font-mono tracking-wider whitespace-nowrap backdrop-blur-md border pointer-events-none shadow-sm animate-fadeIn"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: color,
            color: color
          }}
        >
          {cursor.badgeText}
        </div>
      )}
    </div>
  );
};
