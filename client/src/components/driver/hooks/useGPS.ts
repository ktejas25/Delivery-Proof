import { useState, useRef, useEffect } from 'react';
import { GPSPosition } from '../types';

export const useGPS = (onPositionChange?: (pos: GPSPosition) => void) => {
  const [status, setStatus] = useState<'connecting' | 'live' | 'denied' | 'unavailable'>('connecting');
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    const success = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const newPos = { lat: latitude, lng: longitude, accuracy, timestamp: Date.now() };
      setPosition(newPos);
      setStatus('live');
      onPositionChange?.(newPos);
    };

    const error = (err: GeolocationPositionError) => {
      console.error('GPS error', err);
      setStatus('denied');
    };

    watchId.current = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    });

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [onPositionChange]);

  return { status, position };
};
