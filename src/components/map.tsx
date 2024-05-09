import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

export const Map = ({ map }: MapProps) => {
    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoicmFqYXNnaDE4IiwiYSI6ImNsbDJsaXBxejAxanMzZHA4N2M3Y25nZnQifQ.tax8bLXV0ELmaMYH1PtevQ';
        map.current = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
            center: [80.63333, 19.23333], // starting position [lng, lat]
            zoom: 12 // starting zoom
        });

        // Generate a unique source ID
        const sourceId = 'my-data-' + Math.random().toString(36).substr(2, 9);

        // Add GeoJSON source
        map.current.on('load', function () {
            map.current.addSource(sourceId, {
                type: 'geojson',
                data: './asd/Barsur_Area_Committee.geojson'
            });

            map.current.addLayer({
                id: sourceId,
                type: 'line', // Change this to 'line', 'circle', etc. depending on your GeoJSON data type
                source: sourceId,
                paint: {
                    'line-color': '#000000', // White fill color
            'line-width':4 // Adjust opacity if needed // Adjust opacity if needed
                    }                   // Specify paint properties here, e.g., fill color, line color, etc.
            });
            map.current.addLayer({
                id: sourceId+'askjd',
                type: 'fill', // Change this to 'line', 'circle', etc. depending on your GeoJSON data type
                source: sourceId,
                paint: {
                    'fill-color': '#FFFFFF', // Black outline color
            'fill-opacity': 0.29,
            'fill-outline-color': '#000000' // Adjust opacity if needed // Adjust opacity if needed
                    }                   // Specify paint properties here, e.g., fill color, line color, etc.
            });
        })
    }, []);

    return (
        <section id='map' className='w-full h-[calc(100vh-200px)]' />
    );
};
