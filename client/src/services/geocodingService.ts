/**
 * Geocoding Service for resolving customer addresses to geographic coordinates.
 * Uses OpenStreetMap Nominatim with local caching and progressive query fallbacks.
 */

const memoryCache = new Map<string, [number, number]>();

// Default regional fallback coordinates (Pune, India - regional hub for this platform)
export const DEFAULT_REGIONAL_CENTER: [number, number] = [18.4828, 73.8712]; // New Snehnagar, Market Yard, Pune

// Precise landmark dictionary for known localities & societies in Pune
const LOCAL_LANDMARK_COORDINATES = [
  { match: /new\s*snehnagar/i, coords: [18.4828, 73.8712] as [number, number] },
  { match: /snehnagar/i, coords: [18.4828, 73.8712] as [number, number] },
  { match: /salisbury\s*park/i, coords: [18.4895, 73.8638] as [number, number] },
  { match: /ganga\s*dham/i, coords: [18.4820, 73.8710] as [number, number] },
  { match: /gultekdi/i, coords: [18.4939, 73.8676] as [number, number] },
];

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
  return `geo_cache_v3_${address.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
}

/**
 * Extracts candidate search strings for geocoding, prioritizing granular localities before broad city fallbacks
 */
function extractGeocodeCandidates(rawAddress: string, contextCity = 'Pune'): string[] {
  const trimmed = rawAddress.trim();
  const candidates: string[] = [];

  // 1. Raw address
  candidates.push(trimmed);

  // 2. Remove noisy prefixes like Flat, Plot, Sr No, Shop, Bldg, Co-Op Housing Soc
  const cleanedNoisy = trimmed
    .replace(/\b(Flat|Plot|Shop|Room|Bldg|Building|Apt|Apartment|Sr\.?\s*No\.?|S\.?\s*No\.?|Survey\s*No\.?|Gat\s*No\.?)\s*[:#-]?\s*[\w\d/-]+/gi, '')
    .replace(/\bCo-?Op(\.|\s+)?Housing\s+(Soc|Society)(\.|\s+)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (cleanedNoisy && cleanedNoisy !== trimmed) {
    candidates.push(cleanedNoisy);
  }

  // Segment by commas
  const segments = trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    // Filter out purely numerical or small code tokens like '81', '411037'
    .filter((s) => !/^\d{1,6}$/.test(s) && !/^(Sr|Plot|Flat|Shop)\s*No\.?/i.test(s));

  // Identify city and state
  const knownStates = ['maharashtra', 'karnataka', 'delhi', 'gujarat', 'telangana', 'tamil nadu', 'india'];
  let state = '';
  let city = contextCity || 'Pune';
  const areaParts: string[] = [];

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    const segLower = seg.toLowerCase();
    if (knownStates.includes(segLower)) {
      state = seg;
    } else if (segLower.includes('pune') || segLower.includes('mumbai') || segLower.includes('bangalore') || segLower.includes('delhi')) {
      city = seg;
    } else {
      areaParts.unshift(seg);
    }
  }

  // Prioritize locality combinations (before generic city level fallbacks!)
  if (areaParts.length > 0) {
    const locality = areaParts[areaParts.length - 1]; // e.g. "Market Yard"

    // If there is a society/sub-area (e.g. "New Snehnagar Housing Society")
    if (areaParts.length > 1) {
      const society = areaParts[0]
        .replace(/Co-?Op\s*Housing\s*Soc(\w*)/gi, '')
        .replace(/Housing\s+Society/gi, '')
        .trim();
      if (society && society !== locality) {
        candidates.push(`${society}, ${locality}, ${city}`);
        candidates.push(`${society}, ${city}`);
      }
    }

    // Locality + City (e.g. "Market Yard, Pune")
    candidates.push(`${locality}, ${city}`);
    if (state) {
      candidates.push(`${locality}, ${city}, ${state}`);
    }
  }

  // Segments fallback: locality + city
  if (segments.length >= 2) {
    candidates.push(segments.slice(-2).join(', '));
  }

  // Broad city fallbacks at the very end
  if (city) {
    if (state) candidates.push(`${city}, ${state}`);
    candidates.push(city);
  }

  return [...new Set(candidates)];
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

  // 1. Direct landmark matching
  for (const landmark of LOCAL_LANDMARK_COORDINATES) {
    if (landmark.match.test(trimmed)) {
      return landmark.coords;
    }
  }

  const cacheKey = getCacheKey(trimmed);

  // 2. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 3. Check localStorage cache
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

  // 4. Build progressive search candidates
  const candidates = extractGeocodeCandidates(trimmed, contextCity);

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
    } catch {
      // Continue to next candidate on fetch error
    }
  }

  return DEFAULT_REGIONAL_CENTER;
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
