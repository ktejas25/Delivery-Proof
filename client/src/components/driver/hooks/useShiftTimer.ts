import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export const useShiftTimer = () => {
  // Hook 1: useState (elapsedSeconds)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Hook 2: useState (isRunning) - default true so timer starts for active driver
  const [isRunning, setIsRunning] = useState(true);

  // Hook 3: useRef (intervalRef)
  const intervalRef = useRef<number | null>(null);

  // Hook 4: useRef (startTimeRef)
  const startTimeRef = useRef<number | null>(null);

  // Hook 5: useEffect (initialize or resume shift start time)
  useEffect(() => {
    try {
      const savedStartTime = localStorage.getItem('shiftStartTime');
      const now = Date.now();

      if (savedStartTime) {
        const startTime = parseInt(savedStartTime, 10);
        // If saved within the last 24 hours, resume it
        if (!isNaN(startTime) && startTime > 0 && now - startTime < 24 * 3600 * 1000) {
          startTimeRef.current = startTime;
          setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
          return;
        }
      }

      // If no valid prior shift, start a fresh one
      startTimeRef.current = now;
      localStorage.setItem('shiftStartTime', String(now));
      setElapsedSeconds(0);
    } catch {
      // Fallback in case localStorage is unavailable
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
    }
  }, []);

  // Hook 6: useEffect (run 1-second interval ticker and sync with real clock)
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Ensure startTimeRef is initialized
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
      try {
        localStorage.setItem('shiftStartTime', String(startTimeRef.current));
      } catch {
        // Ignore
      }
    }

    const tick = () => {
      if (startTimeRef.current) {
        const elapsed = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
        setElapsedSeconds(elapsed);
      }
    };

    // Immediate tick
    tick();

    // Regular interval
    intervalRef.current = window.setInterval(tick, 1000);

    // Sync on tab visibility change (e.g. mobile wake or tab focus)
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

  // Hook 7: useCallback (start)
  const start = useCallback(() => {
    if (!startTimeRef.current) {
      const now = Date.now();
      startTimeRef.current = now;
      try {
        localStorage.setItem('shiftStartTime', String(now));
      } catch {
        // Ignore
      }
    }
    setIsRunning(true);
  }, []);

  // Hook 8: useCallback (stop)
  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Hook 9: useCallback (reset)
  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
    startTimeRef.current = null;
    try {
      localStorage.removeItem('shiftStartTime');
    } catch {
      // Ignore
    }
  }, []);

  // Hook 10: useMemo (formattedTime HH:MM:SS)
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
