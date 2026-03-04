import { useState, useRef, useEffect, useCallback } from 'react';
import { GPSPosition, GPSStatus } from '../types';

export const useGPS = () => {
  const [status, setStatus] = useState<GPSStatus>('connecting');
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      setStatus('unavailable');
      return;
    }

    const success = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy: acc } = pos.coords;
      const newPos: GPSPosition = {
        lat: latitude,
        lng: longitude,
        accuracy: acc,
        timestamp: Date.now(),
      };

      setPosition(newPos);
      setAccuracy(acc);
      setStatus('live');

      // Clear any error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };

    const error = (err: GeolocationPositionError) => {
      let errorMessage = 'GPS Error: Unknown error';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'GPS Permission Denied - Enable location access in browser settings';
          setStatus('denied');
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'GPS Position Unavailable - Outdoor location needed';
          setStatus('unavailable');
          break;
        case err.TIMEOUT:
          errorMessage = 'GPS Timeout - Location request took too long';
          setStatus('unavailable');
          break;
        default:
          errorMessage = `GPS Error: Code ${err.code}`;
          setStatus('unavailable');
      }

      console.warn(errorMessage, err);
    };

    // Try with high accuracy
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      });
    } catch (e) {
      console.error('Failed to initialize GPS:', e);
      setStatus('unavailable');
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, []);

  const getPosition = useCallback(async (): Promise<GPSPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const newPos: GPSPosition = {
            lat: latitude,
            lng: longitude,
            accuracy,
            timestamp: Date.now(),
          };
          resolve(newPos);
        },
        (err) => {
          console.warn('Failed to get position:', err.code, err.message);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
      );
    });
  }, []);

  return {
    status,
    position,
    accuracy,
    getPosition,
  };
};
