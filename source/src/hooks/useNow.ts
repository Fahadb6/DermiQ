import { useEffect, useState } from 'react';

/** A clock that ticks once a minute so countdowns and "upcoming / past" states stay current. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    const onVisible = () => { if (!document.hidden) setNow(new Date()); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [intervalMs]);
  return now;
}
