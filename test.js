import mapboxgl from 'mapbox-gl';
import togeojson from '@mapbox/togeojson';

mapboxgl.accessToken = 'pk.eyJ1IjoicHJhdGhhbTI4OSIsImEiOiJjbHZ5dWswemsyZHlwMnJueXdsbDI1NDB4In0.7zMlvnPNO56HFzw3M3QLGw';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11'
});

// Load KML data (you can use fetch, XMLHttpRequest, or a file input element)
const kmlData = '... KML data ...';

// Convert KML to GeoJSON
const geoJsonData = togeojson.kml(kmlData);

// Add GeoJSON data as a source
map.addSource('asd.kml', {
  type: 'geojson',
  data: geoJsonData
});

// Add a layer for the KML data
map.addLayer({
  id: 'kml-layer',
  type: 'line',
  source: 'kml-source',
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  },
  paint: {
    'line-color': '#888',
    'line-width': 2
  }
});