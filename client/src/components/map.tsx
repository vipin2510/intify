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
    }, []);

    return (
        <section id='map' className='w-full h-[calc(100vh-200px)]' />
    );
};
