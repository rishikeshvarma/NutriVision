
'use client';

import { useCelebration, type CelebrationType } from '@/context/CelebrationContext';
import { useEffect, useState, useRef } from 'react';
import { PartyPopper as PartyPopperIcon } from 'lucide-react';

const popperColors = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548',
];

const createParticle = (type: CelebrationType) => {
    if (type === 'burst') {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        return {
            id: Math.random(),
            x: side === 'left' ? -10 : 110,
            y: 110,
            vx: (side === 'left' ? 1 : -1) * (10 + Math.random() * 20),
            vy: -20 - Math.random() * 20,
            rotation: Math.random() * 360,
            vr: (Math.random() - 0.5) * 720,
            color: popperColors[Math.floor(Math.random() * popperColors.length)],
            size: 15 + Math.random() * 10,
        };
    }

    // Default to 'shower'
    return {
        id: Math.random(),
        x: Math.random() * 100, // Start x position (vw)
        y: -10, // Start y position (vh) - off-screen top
        vx: (Math.random() - 0.5) * 20, // Horizontal velocity (less aggressive)
        vy: 10 + Math.random() * 20, // Vertical velocity (downwards)
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 720, // Rotational velocity
        color: popperColors[Math.floor(Math.random() * popperColors.length)],
        size: 10 + Math.random() * 10,
    };
};

export default function PartyPopper() {
  const { isCelebrating, celebrationType, stopCelebration } = useCelebration();
  const [particles, setParticles] = useState<ReturnType<typeof createParticle>[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isCelebrating) {
      const newParticles = Array.from({ length: 250 }, () => createParticle(celebrationType));
      setParticles(newParticles);

      const timeout = setTimeout(() => {
        stopCelebration();
      }, 3000); // Set duration to 3 seconds

      return () => {
        clearTimeout(timeout);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isCelebrating, celebrationType, stopCelebration]);

  useEffect(() => {
    if (particles.length > 0) {
      const updateParticles = () => {
        setParticles(prev => {
          const updated = prev.map(p => ({
            ...p,
            x: p.x + p.vx * 0.05,
            y: p.y + p.vy * 0.05,
            vy: p.vy + 0.8, // Gravity
            rotation: p.rotation + p.vr * 0.05,
          }));

          // Remove particles that are off-screen
          const visibleParticles = updated.filter(p => p.y < 120 && p.y > -20 && p.x > -20 && p.x < 120);

          if (visibleParticles.length === 0) {
            setParticles([]);
            return [];
          }
          return visibleParticles;
        });
        animationFrameRef.current = requestAnimationFrame(updateParticles);
      };
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    }
    
    return () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }
  }, [particles]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          <PartyPopperIcon 
            size={p.size} 
            color={p.color} 
            fill={p.color} 
          />
        </div>
      ))}
    </div>
  );
}
