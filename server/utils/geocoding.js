/**
 * Backend Geocoding Utility
 * Geocodes customer addresses to latitude and longitude using landmark dictionaries and OpenStreetMap Nominatim.
 */

const DEFAULT_COORDINATES = { lat: 18.4828, lng: 73.8712 }; // Default Market Yard / Pune fallback

// High-precision landmark coordinate dictionary for Pune localities & housing societies
const LOCAL_LANDMARK_COORDINATES = [
  { match: /new\s*snehnagar/i, lat: 18.4828, lng: 73.8712 },
  { match: /snehnagar/i, lat: 18.4828, lng: 73.8712 },
  { match: /salisbury\s*park/i, lat: 18.4895, lng: 73.8638 },
  { match: /ganga\s*dham/i, lat: 18.4820, lng: 73.8710 },
  { match: /gultekdi/i, lat: 18.4939, lng: 73.8676 },
];

function extractCandidates(rawAddress, contextCity = 'Pune') {
  if (!rawAddress || typeof rawAddress !== 'string' || !rawAddress.trim()) {
    return [];
  }

  const trimmed = rawAddress.trim();
  const candidates = [];

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
  const areaParts = [];

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

async function geocodeAddress(rawAddress, contextCity = 'Pune') {
  if (!rawAddress || typeof rawAddress !== 'string' || !rawAddress.trim()) {
    return null;
  }

  // 1. Direct landmark match check
  for (const landmark of LOCAL_LANDMARK_COORDINATES) {
    if (landmark.match.test(rawAddress)) {
      return { lat: landmark.lat, lng: landmark.lng };
    }
  }

  const queries = extractCandidates(rawAddress, contextCity);

  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'DeliveryProofServer/1.0',
        },
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch (err) {
      // Continue on fetch error
    }
  }

  return DEFAULT_COORDINATES;
}

module.exports = {
  geocodeAddress,
  DEFAULT_COORDINATES,
};
