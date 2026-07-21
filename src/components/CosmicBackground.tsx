import { useMemo } from 'react';

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export default function StarField({ isDark }: { isDark: boolean }) {
  const stars = useMemo(() => {
    const rand = seededRand(42);
    return Array.from({ length: 220 }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      size: rand() * 1.6 + 0.3,
      opacity: rand() * 0.7 + 0.1,
      delay: rand() * 10,
      dur: rand() * 5 + 3,
    }));
  }, []);

  if (!isDark) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 18% 45%, rgba(70,110,200,0.07) 0%, transparent 55%),' +
            'radial-gradient(ellipse at 82% 22%, rgba(245,158,11,0.05) 0%, transparent 55%),' +
            'radial-gradient(ellipse at 62% 88%, rgba(150,90,160,0.05) 0%, transparent 50%)',
        }}
      />
      <svg className="absolute inset-0 w-full h-full">
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.size}
            fill="white"
            style={{
              opacity: s.opacity,
              animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}