import { useEffect, useState } from "react";

export const Layer = ({ map, showLayer }: LayerProps) => {
    const files = [
      'Amdaighati_Area_Committee.geojson',
      'Area_committee.geojson',
      'Area_committee_Combie.geojson',
      'Area_Committee_wise.geojson',
      'Barsur_Area_Committee.geojson',
      'Bayanar_Area_Committee.geojson',
      'BJR.geojson',
      'Bodhghat_Area_Committe.geojson',
      'BTR.geojson',
      'DWA.geojson',
      'Indravati_Area_Committee.geojson',
      'KGN.geojson',
      'Kiskodo_Area_Committee.geojson',
      'KKR.geojson',
      'Kutul_Area_Committee.geojson',
      'Nelnar_Area_Committee.geojson',
      'NPR.geojson',
      'Partapur_Area_Committee.geojson',
      'Raoghat_Area_Committee.geojson'
    ]

    const [layers, setLayers] = useState<string[]>([]);
    const [sources, setSources] = useState<string[]>([]);
  
    useEffect(() => {
      const createBorders = () => {
        setLayers([]); // Clear the layers state
        setSources([]); // Clear the sources state
        map.current.addSource('source-100',{
          type: 'geojson',
          data: './Geojson/Narayanpur_border.geojson'
        })
        map.current.addLayer({
          id: 'data-100',
          type: 'line',
          source: `source-100`,
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 4,
          },
        });
        files.forEach((file, index) => {
          const sourceId = `source-${index}`;
          const layerId = `data-${index}`;
  
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: `./Geojson/${file}`,
          });
  
          map.current.addLayer({
            id: layerId,
            type: 'line',
            source: `source-${index}`,
            paint: {
              'line-color': '#000000',
              'line-width': 2,
            },
          });
  
          setLayers((prevLayers) => [...prevLayers, layerId]);
          setSources((prevSources) => [...prevSources, sourceId]);
        });
      };
  
      const removeBorders = () => {
        layers.forEach((layer) => {
          map.current.removeLayer(layer);
        });
        if(layers.length >0){
        map.current.removeLayer('data-100');
        map.current.removeSource('source-100');
      }
        sources.forEach((source) => {
          map.current.removeSource(source);
        });
      };
  
      showLayer.border ? createBorders() : removeBorders();
    }, [showLayer.border]);
  
    useEffect(() => {
    }, [layers, sources]);
  
    return (<></>);
  };