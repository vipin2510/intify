import { useEffect, useState } from "react";

export const Layer = ({ map, showLayer }: LayerProps) => {
    const files = [
        'Amdaighati_Area_Committee.geojson',
        'BJR.geojson',
        'BTR.geojson',
        'Barsur_Area_Committee.geojson',
        'Bayanar_Area_Committee.geojson',
        'Bodhghat_Area_Committe.geojson',
        'DWA.geojson',
        'Indravati_Area_Committee.geojson',
        'KGN.geojson',
        'KKR.geojson',
        'Kiskodo_Area_Committee.geojson',
        'Kutul_Area_Committee.geojson',
        'Market.geojson',
        'NPR.geojson',
        'Narayanpur_border.geojson',
        'NPR_PS_CAMP.geojson',
        'Narayanpur.geojson',
        'Nelnar_Area_Committee.geojson',
        'Partapur_Area_Committee.geojson',
        'Raoghat_Area_Committee.geojson',
        'Sarhadi_Market.geojson'
    ]

    const [layers, setLayers] = useState<string[]>([]);
    const [sources, setSources] = useState<string[]>([]);
  
    useEffect(() => {
      const createBorders = () => {
        setLayers([]); // Clear the layers state
        setSources([]); // Clear the sources state
  
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
  
        sources.forEach((source) => {
          map.current.removeSource(source);
        });
      };
  
      showLayer.border ? createBorders() : removeBorders();
    }, [showLayer.border]);
  
    useEffect(() => {
      console.log("Layers:", layers);
      console.log("Sources:", sources);
    }, [layers, sources]);
  
    return (<></>);
  };