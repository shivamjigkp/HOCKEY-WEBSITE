import { useEffect, useState } from 'react';

function getTimeParts(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * Live-updating countdown to a target ISO date. Returns null once the
 * target has passed (caller should show "Live" / "Started" instead).
 */
export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeParts(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}
