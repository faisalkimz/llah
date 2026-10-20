import { useMemo } from 'react';

/**
 * FloatingParticles: Scattered colorful dots and dashes that drift slowly,
 * inspired by the Antigravity hero background.
 *
 * Props:
 *   count     - number of particles (default 50)
 *   colors    - array of hex colors to pick from
 *   className - additional wrapper classes
 *   dark      - if true, uses lighter colors for dark backgrounds
 */
export default function FloatingParticles({
  count = 50,
  colors,
  className = '',
  dark = false,
}) {
  const palette = colors || (dark
    ? ['#38bdf8', '#818cf8', '#fb7185', '#f59e0b', '#34d399', '#a78bfa']
    : ['#3b82f6', '#6366f1', '#ef4444', '#f97316', '#06b6d4', '#8b5cf6']);

  // Generate particles deterministically from a seed
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const seed = ((i * 7919 + 104729) % 1000) / 1000; // pseudo-random
      const seed2 = ((i * 6271 + 87811) % 1000) / 1000;
      const seed3 = ((i * 4219 + 32749) % 1000) / 1000;
      const seed4 = ((i * 9311 + 56891) % 1000) / 1000;
      const seed5 = ((i * 3571 + 71263) % 1000) / 1000;

      const isDash = seed3 > 0.55;
      const color = palette[Math.floor(seed4 * palette.length)];
      const size = isDash ? 1.5 + seed5 * 1.5 : 1 + seed5 * 2;
      const width = isDash ? 4 + seed5 * 8 : size;
      const height = isDash ? size * 0.6 : size;
      const rotation = isDash ? seed3 * 360 : 0;

      // Drift animation parameters
      const duration = 15 + seed * 25; // 15-40s
      const delay = -(seed2 * duration); // stagger start
      const driftX = 20 + seed2 * 40; // 20-60px horizontal drift
      const driftY = 15 + seed3 * 30; // 15-45px vertical drift
      const dirX = seed > 0.5 ? 1 : -1;
      const dirY = seed2 > 0.5 ? 1 : -1;

      items.push({
        id: i,
        x: seed * 100,     // % position
        y: seed2 * 100,    // % position
        color,
        width,
        height,
        rotation,
        isDash,
        opacity: 0.4 + seed5 * 0.5,
        duration,
        delay,
        driftX: driftX * dirX,
        driftY: driftY * dirY,
      });
    }
    return items;
  }, [count, palette]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            borderRadius: p.isDash ? '1px' : '50%',
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
            animation: `particle-float-${p.id % 6} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* 6 keyframe variants for variety */}
      <style>{`
        @keyframes particle-float-0 {
          0%, 100% { transform: translate(0, 0) rotate(${0}deg); }
          25% { transform: translate(25px, -18px) rotate(5deg); }
          50% { transform: translate(-10px, 22px) rotate(-3deg); }
          75% { transform: translate(18px, 8px) rotate(4deg); }
        }
        @keyframes particle-float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-20px, 15px) rotate(-4deg); }
          50% { transform: translate(15px, -20px) rotate(6deg); }
          75% { transform: translate(-8px, -12px) rotate(-2deg); }
        }
        @keyframes particle-float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, 10px) rotate(3deg); }
          50% { transform: translate(-18px, -15px) rotate(-5deg); }
          75% { transform: translate(12px, 25px) rotate(2deg); }
        }
        @keyframes particle-float-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-15px, -25px) rotate(-6deg); }
          50% { transform: translate(22px, 12px) rotate(4deg); }
          75% { transform: translate(-25px, 18px) rotate(-3deg); }
        }
        @keyframes particle-float-4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(18px, 22px) rotate(5deg); }
          50% { transform: translate(-25px, -8px) rotate(-4deg); }
          75% { transform: translate(10px, -20px) rotate(6deg); }
        }
        @keyframes particle-float-5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-22px, -10px) rotate(-3deg); }
          50% { transform: translate(12px, 28px) rotate(5deg); }
          75% { transform: translate(-18px, -22px) rotate(-5deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="particle-float"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
