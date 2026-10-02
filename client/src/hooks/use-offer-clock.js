import { useEffect, useState } from 'react';
// Re-render prices when an open page crosses a flash-sale expiry.
export function useOfferClock(products) {
  const [now, setNow] = useState(Date.now);
  const expiries = (Array.isArray(products) ? products : [products])
    .filter(Boolean).map(p => p.flashSaleEndsAt).filter(Boolean).join('|');
  useEffect(() => {
    const upcoming = expiries.split('|').map(value => new Date(value).getTime()).filter(time => time > Date.now());
    if (!upcoming.length) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(2147483647, Math.max(1, Math.min(...upcoming) - Date.now() + 1)));
    return () => clearTimeout(timer);
  }, [expiries, now]);
}
