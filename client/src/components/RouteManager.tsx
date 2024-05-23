import React, { useState, useEffect } from 'react';
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
  const [shouldAnimateAntPath, setShouldAnimateAntPath] = useState(false);
  let animationFrameId: number | null = null; // Store the ID of the animation frame

  useEffect(() => {
    if (isRoutesGenerated && !shouldAnimateAntPath) {
      animateAntPath();
      setShouldAnimateAntPath(true);
    }
  }, [isRoutesGenerated]);

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

    sortedData.forEach((item, index) => {
      const [longitude, latitude] = convertGRToDecimal(item.GR);
      coordinates.push([longitude, latitude]);

      const formattedDate = new Date(String(item.Date!).split('/').reverse().join('/'))
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

      const popup = new mapboxgl.Popup().setHTML(`<h3>Somdu Makdam:${formattedDate}</h3>`);
      const markerInfo = document.createElement("div");

      markerInfo.className = "marker-info";
      markerInfo.innerHTML = formattedDate;
      markerInfo.style.backgroundColor = "#ffffff";

      // Set marker color based on index
      markerInfo.style.backgroundColor = index === 0 ? '#00ff00' : index === sortedData.length - 1 ? '#ff0000' : '#ffffff';

      const marker = new mapboxgl.Marker({
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
        'line-color': 'red',
        'line-width': 4,
        'line-dasharray': [0, 4, 3], // Initial dash array for ant path animation
      },
    });

    // Add the line background layer
    map.current.addLayer({
      type: 'line',
      source: source  ,
      id: 'line-background',
      paint: {
        'line-color': 'red',
        'line-width': 5,
        'line-opacity': 0.3
      }
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
        if (map.current.getLayer('line-background')) {
          map.current.removeLayer('line-background');
        }
        map.current.removeLayer(route.layer);
        map.current.removeSource(route.source);
      }
    });
    setRoutes([]);
    setIsRoutesGenerated(false);
    setShouldAnimateAntPath(false);
    cancelAnimationFrame(animationFrameId!); // Stop the animation
  };

  const getDayDifference = (dateString1: string, dateString2: string) => {
    const date1 = new Date(dateString1.split('/').reverse().join('/'));
    const date2 = new Date(dateString2.split('/').reverse().join('/'));
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      // Handle invalid date strings here
      return 'Invalid date';
    }

    const diffInMs = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  };

  const animateAntPath = () => {
    const dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ];

    let step = 0;

    function animateDashArray(timestamp:any) {
      const newStep = parseInt(String((timestamp / 50) % dashArraySequence.length));

      if (newStep !== step) {
        if (map.current.getLayer('route-layer')) { // Check if the layer still exists
          map.current.setPaintProperty(
            'route-layer',
            'line-dasharray',
            dashArraySequence[step]
          );
        } else {
          cancelAnimationFrame(animationFrameId!); // Stop the animation if the layer is removed
          return;
        }
        step = newStep;
      }

      animationFrameId = requestAnimationFrame(animateDashArray);
    }

    animateDashArray(0);
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