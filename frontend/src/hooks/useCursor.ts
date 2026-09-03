import { useState, useEffect, useRef } from 'react';

export interface CursorState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isHovering: boolean;
  badgeText: string;
  cursorVariant: 'default' | 'action' | 'inspect' | 'attack' | 'approve' | 'ask' | 'block' | 'hidden';
}

export function useCursor() {
  const [cursor, setCursor] = useState<CursorState>({
    x: -100,
    y: -100,
    targetX: -100,
    targetY: -100,
    isHovering: false,
    badgeText: '',
    cursorVariant: 'default'
  });

  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;

  useEffect(() => {
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Find closest interactive element with data-cursor attributes
      const target = (e.target as HTMLElement)?.closest('[data-cursor], button, a, input, select') as HTMLElement | null;

      let badge = '';
      let variant: CursorState['cursorVariant'] = 'default';
      let hovering = false;

      if (target) {
        hovering = true;
        badge = target.getAttribute('data-cursor-badge') || '';
        variant = (target.getAttribute('data-cursor-variant') as CursorState['cursorVariant']) || 'action';
      }

      setCursor((prev) => ({
        ...prev,
        targetX: e.clientX,
        targetY: e.clientY,
        isHovering: hovering,
        badgeText: badge,
        cursorVariant: variant
      }));
    };

    const handleMouseLeave = () => {
      setCursor((prev) => ({
        ...prev,
        cursorVariant: 'hidden'
      }));
    };

    // Smooth lerp loop
    const updatePosition = () => {
      setCursor((prev) => {
        const dx = prev.targetX - prev.x;
        const dy = prev.targetY - prev.y;
        return {
          ...prev,
          x: prev.x + dx * 0.25,
          y: prev.y + dy * 0.25
        };
      });
      animId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    animId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return cursor;
}
