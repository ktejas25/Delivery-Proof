/**
 * Backend Geocoding Utility
 * Geocodes customer addresses to latitude and longitude using OpenStreetMap Nominatim.
 */

const DEFAULT_COORDINATES = { lat: 18.5204, lng: 73.8567 }; // Pune default

async function geocodeAddress(rawAddress) {
  if (!rawAddress || typeof rawAddress !== 'string' || !rawAddress.trim()) {
    return null;
  }

  const trimmed = rawAddress.trim();
  const cleaned = trimmed.replace(
    /^(Flat|Plot|Shop|Room|Bldg|Building|Apt|Apartment|Sr\s*No\.?)\s*[^,]+,\s*/i,
    ''
  ).trim();

  const queries = [trimmed];
  if (cleaned && cleaned !== trimmed) {
    queries.push(cleaned);
  }

  const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    queries.push(parts.slice(-2).join(', '));
    queries.push(parts.slice(-1)[0]);
  }

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

  return null;
}

module.exports = {
  geocodeAddress,
  DEFAULT_COORDINATES,
};
