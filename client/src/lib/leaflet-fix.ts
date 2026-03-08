import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

const markerIconUrl = new URL(
  "leaflet/dist/images/marker-icon.png",
  import.meta.url,
).href;
const markerIconRetinaUrl = new URL(
  "leaflet/dist/images/marker-icon-2x.png",
  import.meta.url,
).href;
const markerShadowUrl = new URL(
  "leaflet/dist/images/marker-shadow.png",
  import.meta.url,
).href;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetinaUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});
