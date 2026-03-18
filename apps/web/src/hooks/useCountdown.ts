import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formatted: string;
}

export function useCountdown(targetDate: Date | string | null | undefined): CountdownResult {
  const calculateRemaining = useCallback((): CountdownResult => {
    if (!targetDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true, formatted: '--' };
    }

    const target = dayjs(targetDate);
    const now = dayjs();
    const diff = target.diff(now, 'second');

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true, formatted: 'Expired' };
    }

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    let formatted: string;
    if (days > 0) {
      formatted = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      formatted = `${minutes}m ${seconds}s`;
    }

    return { days, hours, minutes, seconds, totalSeconds: diff, isExpired: false, formatted };
  }, [targetDate]);

  const [countdown, setCountdown] = useState<CountdownResult>(calculateRemaining);

  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      const result = calculateRemaining();
      setCountdown(result);
      if (result.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, calculateRemaining]);

  return countdown;
}
