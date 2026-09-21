import { useEffect, useRef, useState } from 'react';

export function useCountUp(
  target: number,
  { duration = 1600, decimals = 0, suffix = '' } = {}
) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('0' + suffix);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        let start: number | null = null;
        const step = (ts: number) => {
          if (start === null) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setValue((target * eased).toFixed(decimals) + suffix);
          if (p < 1) requestAnimationFrame(step);
          else setValue(target.toFixed(decimals) + suffix);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, decimals, suffix]);

  return { ref, value };
}