import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export const Layer = ({ map }: { map: any }) => {
  const { showLayer } = useAppStore();

  // Base GitHub raw path
  const baseUrl =
    "https://raw.githubusercontent.com/vipin2510/intify/webonlineveersion/client/public/Geojson";

  const files = [
    "Amdaighati_Area_Committee.geojson",
    "Barsur_Area_Committee.geojson",
    "Bayanar_Area_Committee.geojson",
    "BJR.geojson",
    "Bodhghat_Area_Committe.geojson",
    "BTR.geojson",
    "DWA.geojson",
    "Indravati_Area_Committee.geojson",
    "KGN.geojson",
    "Kiskodo_Area_Committee.geojson",
    "KKR.geojson",
    "Kutul_Area_Committee.geojson",
    "Nelnar_Area_Committee.geojson",
    "NPR.geojson",
    "Partapur_Area_Committee.geojson",
    "Raoghat_Area_Committee.geojson",
  ];

  const [layers, setLayers] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    const createBorders = () => {
      setLayers([]);
      setSources([]);

      // Border file
      map.current.addSource("source-100", {
        type: "geojson",
        data: `${baseUrl}/Narayanpur_border.geojson`, // ✅ now from GitHub raw
      });

      map.current.addLayer({
        id: "data-100",
        type: "line",
        source: "source-100",
        paint: {
          "line-color": "#FFFFFF",
          "line-width": 4,
        },
      });

      // Other committee files
      files.forEach((file, index) => {
        const sourceId = `source-${index}`;
        const layerId = `data-${index}`;

        map.current.addSource(sourceId, {
          type: "geojson",
          data: `${baseUrl}/${file}`, // ✅ fetch directly from GitHub
        });

        map.current.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#000000",
            "line-width": 2,
          },
        });

        setLayers((prevLayers) => [...prevLayers, layerId]);
        setSources((prevSources) => [...prevSources, sourceId]);
      });
    };

    const removeBorders = () => {
      layers.forEach((layer) => {
        if (map.current.getLayer(layer)) {
          map.current.removeLayer(layer);
        }
      });

      if (map.current.getLayer("data-100")) {
        map.current.removeLayer("data-100");
      }
      if (map.current.getSource("source-100")) {
        map.current.removeSource("source-100");
      }

      sources.forEach((source) => {
        if (map.current.getSource(source)) {
          map.current.removeSource(source);
        }
      });
    };

    if (showLayer.border) {
      createBorders();
    } else {
      removeBorders();
    }
  }, [showLayer.border]);

  return null;
};
