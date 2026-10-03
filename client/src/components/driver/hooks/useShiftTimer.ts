import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export interface UseShiftTimerOptions {
  startTime?: string | number | null;
  isActive?: boolean;
}

export const useShiftTimer = (options?: UseShiftTimerOptions) => {
  const { startTime = null, isActive = false } = options || {};

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (!isActive || !startTime) return 0;
    const timeMs = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime;
    if (isNaN(timeMs) || timeMs <= 0) return 0;
    return Math.max(0, Math.floor((Date.now() - timeMs) / 1000));
  });

  const [isRunning, setIsRunning] = useState<boolean>(Boolean(isActive && startTime));
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Sync with options changes (authoritative backend / central shift state)
  useEffect(() => {
    if (isActive && startTime) {
      const timeMs = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime;
      if (!isNaN(timeMs) && timeMs > 0) {
        startTimeRef.current = timeMs;
        const elapsed = Math.max(0, Math.floor((Date.now() - timeMs) / 1000));
        setElapsedSeconds(elapsed);
        setIsRunning(true);
        return;
      }
    }

    // Shift is not active or no valid start time
    if (!isActive) {
      startTimeRef.current = null;
      setElapsedSeconds(0);
      setIsRunning(false);
    }
  }, [isActive, startTime]);

  // Regular interval ticker based strictly on real wall-clock difference
  useEffect(() => {
    if (!isRunning || !startTimeRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const tick = () => {
      if (startTimeRef.current) {
        const elapsed = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
        setElapsedSeconds(elapsed);
      }
    };

    tick();
    intervalRef.current = window.setInterval(tick, 1000);

    // Sync on tab visibility change (prevent lag when tab is backgrounded)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isRunning]);

  const start = useCallback((initialTime?: number | string) => {
    const timeMs = initialTime
      ? (typeof initialTime === 'string' ? new Date(initialTime).getTime() : initialTime)
      : Date.now();
    startTimeRef.current = timeMs;
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - timeMs) / 1000)));
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
    startTimeRef.current = null;
  }, []);

  const formattedTime = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  return {
    elapsedSeconds,
    formattedTime,
    isRunning,
    start,
    stop,
    reset,
  };
};

export default useShiftTimer;
