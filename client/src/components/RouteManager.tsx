import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { convertGRToDecimal } from '@/utils/conversion';

interface RouteWithMarker {
    source: string;
    layer: string;
    marker: mapboxgl.Marker;
  }
  
  interface RouteWithNullMarker {
    source: string;
    layer: string;
    marker: null;
  }
  
  type RouteType = RouteWithMarker | RouteWithNullMarker;

export const RouteManager: React.FC<RouteManagerProps> = ({
  data,
  map,
}) => {
    const [routes, setRoutes] = useState<RouteType[]>([]);
  const [isRoutesGenerated, setIsRoutesGenerated] = useState(false);

  const generateRoutes = () => {
    // Clear previous routes
    clearRoutes();
  
    // Filter data by "Name_" and sort by date
    const sortedData = data
      .filter((item) => item.Name_ === 'smd')
      .sort((a, b) => {
        const dateA = new Date(String(a.Date!).split('/').reverse().join('/'));
        const dateB = new Date(String(b.Date!).split('/').reverse().join('/'));
        return dateA.getTime() - dateB.getTime();
      });
  
      const coordinates: [number, number][] = [];
    let previousMarker: { marker: mapboxgl.Marker; date: string } | null = null;
  
    sortedData.forEach((item) => {
      const [longitude, latitude] = convertGRToDecimal(item.GR);
      coordinates.push([longitude, latitude]);
  
      const formattedDate = new Date(String(item.Date!).split('/').reverse().join('/'))
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        console.log(formattedDate)
  
      const popup = new mapboxgl.Popup().setHTML(`<h3>Somdu Makdam:${formattedDate}</h3>`);
      const markerInfo = document.createElement("div");
  
      markerInfo.className = "marker-info";
      markerInfo.innerHTML = formattedDate;
      markerInfo.style.backgroundColor = "#ffffff";
      const marker = new mapboxgl.Marker({
        color: '#ff0000',
        element: markerInfo,
      })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current);
  
      if (previousMarker) {
        const dayDifference = getDayDifference(
          String(item.Date!),
          previousMarker.date
        );
        popup.setHTML(
          `<h3>Somdu Makdam:</h3>
          <p>Days since last movement: ${dayDifference}</p>`
        );
      }
  
      setRoutes((prevRoutes) => [
        ...prevRoutes,
        { source: '', layer: '', marker },
      ]);
  
      previousMarker = { marker, date: String(item.Date!) };
    });

    const source = 'route-source';
    const layer = 'route-layer';

    map.current.addSource(source, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        ],
      },
    });

    map.current.addLayer({
      id: layer,
      type: 'line',
      source: source,
      paint: {
        'line-color': '#ff0000',
        'line-width': 2,
      },
    });

    setRoutes((prevRoutes) => [
      ...prevRoutes,
      { source, layer, marker: null },
    ]);
    setIsRoutesGenerated(true);
  };

  const clearRoutes = () => {
    routes.forEach((route) => {
      if (route.marker) {
        route.marker.remove();
      }
      if (route.layer) {
        map.current.removeLayer(route.layer);
        map.current.removeSource(route.source);
      }
    });
    setRoutes([]);
    setIsRoutesGenerated(false);
  };

  const getDayDifference = (dateString1: string, dateString2: string) => {
    const date1 = new Date(dateString1.split('/').reverse().join('/'));
    const date2 = new Date(dateString2.split('/').reverse().join('/'));
    console.log(date2)
    console.log(date1)
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      // Handle invalid date strings here
      return 'Invalid date';
    }
  
    const diffInMs = Math.abs(date1.getTime() - date2.getTime());
    console.log(diffInMs)
    console.log(Math.ceil(diffInMs / (1000 * 60 * 60 * 24)))
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  };
  return (
    <div className="absolute top-24 left-4 z-10 bg-white p-2 rounded-md shadow">
      <button
        onClick={() => (isRoutesGenerated ? clearRoutes() : generateRoutes())}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isRoutesGenerated ? 'Clear Routes' : 'Generate Routes'}
      </button>
    </div>
  );
};