'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorState = 'default' | 'hover-link' | 'hover-image' | 'dragging';

import { useState } from 'react';

export default function ExperimentalCursor() {
  const [state, setState] = useState<CursorState>('default');
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // Exact position (no lag) — for the small dot
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);

  // Spring position (lagged) — for the large circle
  const circleX = useSpring(dotX, { damping: 32, stiffness: 100, mass: 1 });
  const circleY = useSpring(dotY, { damping: 32, stiffness: 100, mass: 1 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'A' || t.tagName === 'BUTTON' || t.closest('a') || t.closest('button')) {
        setState('hover-link');
      } else if (t.tagName === 'IMG' || t.closest('img')) {
        setState('hover-image');
      } else if (t.hasAttribute('data-draggable')) {
        setState('hover-link');
      } else {
        setState('default');
      }
    };

    const onDown = () => setState('dragging');
    const onUp = () => setState('default');

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, [dotX, dotY, visible]);

  // Circle styles by state
  const circleVariants = {
    default: {
      width: 80,
      height: 80,
      backgroundColor: 'rgba(0, 212, 255, 0.08)',
      borderColor: 'rgba(0, 212, 255, 0.35)',
      borderWidth: 1,
      scale: 1,
    },
    'hover-link': {
      width: 120,
      height: 120,
      backgroundColor: 'rgba(226, 221, 220, 0.10)',
      borderColor: 'rgba(226, 221, 220, 0.5)',
      borderWidth: 1.5,
      scale: 1,
    },
    'hover-image': {
      width: 100,
      height: 100,
      backgroundColor: 'transparent',
      borderColor: 'rgba(0, 212, 255, 0.7)',
      borderWidth: 2,
      scale: 1,
    },
    dragging: {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(226, 221, 220, 0.2)',
      borderColor: 'rgba(226, 221, 220, 0.6)',
      borderWidth: 1.5,
      scale: 0.9,
    },
  };

  // Dot styles by state
  const dotVariants = {
    default: { width: 6, height: 6, backgroundColor: '#00D4FF' },
    'hover-link': { width: 8, height: 8, backgroundColor: '#E2DDDC' },
    'hover-image': { width: 4, height: 4, backgroundColor: '#00D4FF' },
    dragging: { width: 10, height: 10, backgroundColor: '#E2DDDC' },
  };

  if (isTouchDevice) return null;

  return (
    <>
      {/* Large lagged circle */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border-solid"
        style={{
          x: circleX,
          y: circleY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
          backdropFilter: 'none',
        }}
        animate={circleVariants[state]}
        initial={circleVariants.default}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Small exact dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
        animate={dotVariants[state]}
        initial={dotVariants.default}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </>
  );
}
