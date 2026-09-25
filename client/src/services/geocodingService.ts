/**
 * Geocoding Service for resolving customer addresses to geographic coordinates.
 * Uses OpenStreetMap Nominatim with local caching and progressive query fallbacks.
 */

const memoryCache = new Map<string, [number, number]>();

// Default regional fallback coordinates (Pune, India - regional hub for this platform)
export const DEFAULT_REGIONAL_CENTER: [number, number] = [18.5204, 73.8567];

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generates cache key from address string
 */
function getCacheKey(address: string): string {
  return `geo_cache_${address.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
}

/**
 * Clean noisy address prefixes like apartment numbers, flat numbers, plot numbers
 */
function cleanAddress(address: string): string {
  return address
    .replace(/^(Flat|Plot|Shop|Room|Bldg|Building|Apt|Apartment|Sr\s*No\.?)\s*[^,]+,\s*/i, '')
    .trim();
}

/**
 * Geocodes an address into [latitude, longitude].
 * Utilizes memory cache, localStorage cache, and progressive query matching.
 */
export async function geocodeAddress(
  rawAddress: string,
  contextCity = 'Pune'
): Promise<[number, number] | null> {
  if (!rawAddress || typeof rawAddress !== 'string' || !rawAddress.trim()) {
    return null;
  }

  const trimmed = rawAddress.trim();
  const cacheKey = getCacheKey(trimmed);

  // 1. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. Check localStorage cache
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
        memoryCache.set(cacheKey, parsed as [number, number]);
        return parsed as [number, number];
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  // 3. Build progressive search candidates
  const candidates: string[] = [];
  candidates.push(trimmed);

  const cleaned = cleanAddress(trimmed);
  if (cleaned && cleaned !== trimmed) {
    candidates.push(cleaned);
  }

  // If address doesn't explicitly mention the city, try appending it
  if (contextCity && !trimmed.toLowerCase().includes(contextCity.toLowerCase())) {
    candidates.push(`${cleaned || trimmed}, ${contextCity}`);
  }

  // Comma-separated parts fallback (e.g. "Kothrud, Pune" or "FC Road, Pune")
  const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    candidates.push(parts.slice(-2).join(', '));
    candidates.push(parts.slice(-1)[0]);
  }

  for (const query of candidates) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DeliveryProofApp/1.0',
        },
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        if (!isNaN(lat) && !isNaN(lng)) {
          const coords: [number, number] = [lat, lng];
          memoryCache.set(cacheKey, coords);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(coords));
          } catch {
            // Ignore quota errors
          }
          return coords;
        }
      }
    } catch (err) {
      // Continue to next candidate on fetch error
    }
  }

  return null;
}

/**
 * Finds the best baseline center coordinate from a list of deliveries,
 * or returns the default regional hub.
 */
export function getBaselineFromDeliveries(
  deliveries: Array<{ address_lat?: number; address_lng?: number }>
): [number, number] {
  for (const d of deliveries) {
    if (d.address_lat && d.address_lng && d.address_lat !== 0 && d.address_lng !== 0) {
      return [d.address_lat, d.address_lng];
    }
  }
  return DEFAULT_REGIONAL_CENTER;
}
