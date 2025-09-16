import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { stringToColor } from "@/lib/utils";
import { convertGRToDecimal } from "@/utils/conversion";
import { handleFile } from "@/utils/file-reader";
import { MapMouseEvent } from "mapbox-gl";
import { useAppStore } from "@/store/useAppStore";

export const XLS = ({ map }: { map: any }) => {
  const [filteredData, setFilteredData] = useState<xlsDataType[]>([]);

  // Zustand store
  const {
    showLayer,
    data,
    setData,
    legend,
    setXlsData,
    removeUnknown,
    setRemoveUnknown,
    setGeojsonData,
    setFilteredData: setStoreFilteredData,
  } = useAppStore();

  function formatGr(value: string): string | undefined {
    const splitValue = value.trim().split(" ");
    const replacedValue = splitValue.map((item) => item.replace("°", ""));
    return replacedValue.join(" ");
  }

  // 🔹 Fetch sheet data
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(
        "https://intify-server.vercel.app/api/spreadsheet?name=int+main+sheet"
      );
      const rows = res.data;
      rows.shift();

      if (rows.length === 0) return;
      const processedData = rows
        .filter((rows: any) => rows[5] && formatGr(rows[5]))
        .map((row: any) => {
          return {
            Date: row[0],
            IntContent: row[2],
            Name: row[4],
            Name_: row[3],
            IntUniqueNo: parseInt(row[1]),
            GR: formatGr(row[5]),
            Strength: parseInt(row[8]),
            Source: row[10],
            Type: row[11],
            Rank: row[12],
            AreaCommittee: row[13],
            District: row[14],
            PoliceStation: row[15],
            Division: row[17],
            Week: parseInt(row[18]),
            Month: parseInt(row[19]),
            UID: row[21],
          };
        });
      console.log(processedData);
      setFilteredData(processedData);
      setStoreFilteredData(processedData);
      setData(processedData);
      setXlsData(processedData);
    };
    fetchData();
  }, []);

  // 🔹 Filter unknowns
  useEffect(() => {
    const updateFilteredData = () => {
      const updatedFilteredData = removeUnknown
        ? data.filter(
            (el) =>
              !Object.values(el).some(
                (value) => value?.toString().toLowerCase() === "unknown"
              )
          )
        : data;
      setFilteredData(updatedFilteredData);
    };
    if (data.length > 0) {
      updateFilteredData();
    }
  }, [data, removeUnknown]);

  // 🔹 Function to fit map bounds to show all data points
  const fitMapToData = (features: any[]) => {
    if (!map?.current || features.length === 0) return;

    const coordinates = features.map((feature) => feature.geometry.coordinates);
    if (coordinates.length === 0) return;

    // Calculate bounds
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach((coord) => bounds.extend(coord));

    // Fit map to bounds with padding and smooth transition
    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15,
      duration: 1000,
    });
  };

  // 🔹 Map cluster rendering
  useEffect(() => {
    if (!map?.current || filteredData.length === 0) return;
    
    // If markers are disabled, hide the layers and return
    if (!showLayer.marker) {
      [
        "clusters",
        "cluster-count", 
        "unclustered-point",
        "unclustered-label",
      ].forEach((layer) => {
        if (map.current.getLayer(layer)) {
          map.current.setLayoutProperty(layer, 'visibility', 'none');
        }
      });
      return;
    }
    // Convert to GeoJSON
    const geojson = {
      type: "FeatureCollection" as const,
      features: filteredData
        .map((el) => {
          const coords = convertGRToDecimal(el.GR);
          if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return null;
          let value = el[legend as keyof xlsDataType] || el.Name;
          // fallback if numeric
          if (!value || !isNaN(Number(value))) value = el.Name;

          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [coords[0], coords[1]] as [number, number],
            },
            properties: {
              legend: value,
              uid: el.UID,
              intUniqueNo: el.IntUniqueNo,
              intContent: el.IntContent,
              color: stringToColor(el.Name_),
            },
          };
        })
        .filter(Boolean) as any[],
    };

    // Store GeoJSON in global state for KML generation
    setGeojsonData(geojson);

    // Cleanup if re-render
    if (map.current.getSource("points")) {
      [
        "clusters",
        "cluster-count",
        "unclustered-point",
        "unclustered-label",
      ].forEach((layer) => {
        if (map.current.getLayer(layer)) map.current.removeLayer(layer);
      });
      map.current.removeSource("points");
    }

    // Add clustering source
    map.current.addSource("points", {
      type: "geojson",
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 15,
    });

    // Clustered circles
    map.current.addLayer({
      id: "clusters",
      type: "circle",
      source: "points",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#1978c8",
        "circle-radius": 10,
        "circle-opacity": 0.8,
      },
    });

    // Cluster labels (just number of points)
    map.current.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "points",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });

    // Unclustered points (colored circles)
    map.current.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "points",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": ["get", "color"],
        "circle-radius": 6,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });

    // 🔹 Unclustered point labels (legend text instead of numbers)
    map.current.addLayer({
      id: "unclustered-label",
      type: "symbol",
      source: "points",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "text-field": ["get", "legend"],
        "text-size": 11,
        "text-offset": [0, 1],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#111",
        "text-halo-color": "#fff",
        "text-halo-width": 1,
      },
    });

    // Popup on click (single point)
    map.current.on(
      "click",
      "unclustered-point",
      (e: MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point"],
        });
        if (!features || !features[0]) return;

        const { intUniqueNo, intContent, uid } = features[0].properties as any;

        new mapboxgl.Popup()
          .setLngLat((features[0].geometry as any).coordinates)
          .setHTML(
            `<h3>${intUniqueNo}: ${intContent}</h3>
         <a href="/profile/${uid}" target="_blank">View Profile</a>`
          )
          .addTo(map.current!);
      }
    );

    // Zoom into clusters
    map.current.on(
      "click",
      "clusters",
      (e: MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features || !features[0]) return;

        const clusterId = features[0].properties?.cluster_id;
        const source: any = map.current?.getSource("points");

        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.current?.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom,
          });
        });
      }
    );

    // Show all marker layers
    [
      "clusters",
      "cluster-count",
      "unclustered-point", 
      "unclustered-label",
    ].forEach((layer) => {
      if (map.current.getLayer(layer)) {
        map.current.setLayoutProperty(layer, 'visibility', 'visible');
      }
    });

    // Fit map to show all data points after layers are added
    setTimeout(() => {
      fitMapToData(geojson.features);
    }, 100);
  }, [map?.current, filteredData, legend, showLayer.marker]);

  // 🔹 Update map view when legend changes (for better user experience)
  useEffect(() => {
    if (!map?.current || !showLayer.marker || filteredData.length === 0) return;

    // Get current GeoJSON data and fit map to it
    const currentGeojson = {
      type: "FeatureCollection" as const,
      features: filteredData
        .map((el) => {
          const coords = convertGRToDecimal(el.GR);
          if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return null;
          let value = el[legend as keyof xlsDataType] || el.Name;
          if (!value || !isNaN(Number(value))) value = el.Name;

          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [coords[0], coords[1]] as [number, number],
            },
            properties: {
              legend: value,
              uid: el.UID,
              intUniqueNo: el.IntUniqueNo,
              intContent: el.IntContent,
              color: stringToColor(el.Name_),
            },
          };
        })
        .filter(Boolean) as any[],
    };

    // Fit map to show all data points when legend changes
    setTimeout(() => {
      fitMapToData(currentGeojson.features);
    }, 100);
  }, [legend]);

  return (
    <>
      <label
        htmlFor="xls-file"
        className="absolute hidden top-4 left-4 p-2 px-3 z-10 bg-blue-500 text-white rounded"
      >
        Import Excel
      </label>
      <input
        id="xls-file"
        type="file"
        onChange={(event) => handleFile(event, setData, setXlsData)}
        className="hidden"
      />
      <button
        onClick={() => setRemoveUnknown(!removeUnknown)}
        className="absolute text-sm top-16 right-4 p-2 px-3 z-10 bg-red-500 text-white rounded"
      >
        {removeUnknown ? "Include Unknown" : "Remove Unknown"}
      </button>
    </>
  );
};
