import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export const useShiftTimer = () => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Load saved shift time from localStorage on mount
  useEffect(() => {
    const savedStartTime = localStorage.getItem('shiftStartTime');
    if (savedStartTime) {
      const startTime = parseInt(savedStartTime, 10);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      setIsRunning(true);
      startTimeRef.current = startTime;
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isRunning) {
      // Stop the interval when not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialize start time if not already set
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
      localStorage.setItem('shiftStartTime', String(startTimeRef.current));
    }

    // Set up the interval
    intervalRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const start = useCallback(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      localStorage.setItem('shiftStartTime', String(startTimeRef.current));
    }
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
    startTimeRef.current = null;
    localStorage.removeItem('shiftStartTime');
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
