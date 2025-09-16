import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Layers } from "lucide-react"; // ✅ icon

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
  const [open, setOpen] = useState(false);

  // ✅ extra layers toggle state
  const [extraLayers, setExtraLayers] = useState({
    village: false,
    camp: false,
    ps: false,
    road: false,
    otherDistrict: false,
  });

  // --- Border + Committee Layers ---
  useEffect(() => {
    const createBorders = () => {
      setLayers([]);
      setSources([]);

      // Border file
      map.current.addSource("source-100", {
        type: "geojson",
        data: `${baseUrl}/Narayanpur_border.geojson`,
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

      // Committees
      files.forEach((file, index) => {
        const sourceId = `source-${index}`;
        const layerId = `data-${index}`;

        map.current.addSource(sourceId, {
          type: "geojson",
          data: `${baseUrl}/${file}`,
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

        setLayers((prev) => [...prev, layerId]);
        setSources((prev) => [...prev, sourceId]);
      });
    };

    const removeBorders = () => {
      layers.forEach((layer) => {
        if (map.current.getLayer(layer)) map.current.removeLayer(layer);
      });

      if (map.current.getLayer("data-100")) map.current.removeLayer("data-100");
      if (map.current.getSource("source-100")) map.current.removeSource("source-100");

      sources.forEach((src) => {
        if (map.current.getSource(src)) map.current.removeSource(src);
      });
    };

    if (showLayer.border) {
      createBorders();
    } else {
      removeBorders();
    }
  }, [showLayer.border]);

  // --- Extra Layers Handler ---
  useEffect(() => {
    const addExtraLayer = (id: string, file: string, color: string) => {
      if (!map.current.getSource(id)) {
        map.current.addSource(id, {
          type: "geojson",
          data: `${baseUrl}/${file}`,
        });
        map.current.addLayer({
          id,
          type: "line",
          source: id,
          paint: {
            "line-color": color,
            "line-width": 2,
          },
        });
      }
    };

    const removeExtraLayer = (id: string) => {
      if (map.current.getLayer(id)) map.current.removeLayer(id);
      if (map.current.getSource(id)) map.current.removeSource(id);
    };

    // toggle each
    extraLayers.village
      ? addExtraLayer("village-layer", "Basic Village Data.geojson", "#008000")
      : removeExtraLayer("village-layer");

    extraLayers.camp
      ? addExtraLayer("camp-layer", "CAMP.geojson", "#FF0000")
      : removeExtraLayer("camp-layer");

    extraLayers.ps
      ? addExtraLayer("ps-layer", "PS.geojson", "#0000FF")
      : removeExtraLayer("ps-layer");

    extraLayers.road
      ? addExtraLayer("road-layer", "ROAD.geojson", "#FFA500")
      : removeExtraLayer("road-layer");

    extraLayers.otherDistrict
      ? addExtraLayer("other-district-layer", "other distirict.geojson", "#800080")
      : removeExtraLayer("other-district-layer");
  }, [extraLayers]);

  return (
    <>
      {/* ✅ Toggle Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 bg-white rounded shadow hover:bg-gray-100"
        >
          <Layers size={20} />
        </button>

        {/* ✅ Dropdown */}
        {open && (
          <div className="mt-2 bg-white p-3 rounded shadow space-y-2 w-48">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={extraLayers.village}
                onChange={() =>
                  setExtraLayers({ ...extraLayers, village: !extraLayers.village })
                }
              />
              <span>Village</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={extraLayers.camp}
                onChange={() =>
                  setExtraLayers({ ...extraLayers, camp: !extraLayers.camp })
                }
              />
              <span>Camp</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={extraLayers.ps}
                onChange={() =>
                  setExtraLayers({ ...extraLayers, ps: !extraLayers.ps })
                }
              />
              <span>Police Station</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={extraLayers.road}
                onChange={() =>
                  setExtraLayers({ ...extraLayers, road: !extraLayers.road })
                }
              />
              <span>Road</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={extraLayers.otherDistrict}
                onChange={() =>
                  setExtraLayers({
                    ...extraLayers,
                    otherDistrict: !extraLayers.otherDistrict,
                  })
                }
              />
              <span>Other District</span>
            </label>
          </div>
        )}
      </div>
    </>
  );
};
