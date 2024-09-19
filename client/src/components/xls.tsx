import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { stringToColor } from "@/lib/utils";
import { convertGRToDecimal } from "@/utils/conversion";
import { handleFile } from "@/utils/file-reader";

export const XLS = ({
  showLayer,
  data,
  setData,
  legend,
  setkmlData,
  setXlsData,
  map,
  removeUnknown,
  setRemoveUnknown,
}: XLSProps) => {
  const [filteredData, setFilteredData] = useState<xlsDataType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(
        "https://intify-server.vercel.app/api/spreadsheet?name=int+main+sheet",
      );
      const rows = res.data;
      rows.shift();
      const processedData = rows.map((row:any) => ({
        Date: row[0],
        IntContent: row[2],
        Name: row[4],
        Name_: row[3],
        IntUniqueNo: parseInt(row[1]),
        GR: row[5],
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
      }));
      setFilteredData(processedData);
      setData(processedData);
      setXlsData(processedData);
    };
    showLayer.marker && fetchData();
  }, [showLayer.marker]);

  useEffect(() => {
    const updateFilteredData = () => {
      const updatedFilteredData = removeUnknown
        ? data.filter(
            (el) =>
              !Object.values(el).some(
                (value) => value?.toString().toLowerCase() === "unknown",
              ),
          )
        : data;
      setFilteredData(updatedFilteredData);
    };

    updateFilteredData();
  }, [data, removeUnknown]);

  useEffect(() => {
    const markers: mapboxgl.Marker[] = [];
    let lineLayerId = 'marker-lines';

    const createMarkers = () => {
      setkmlData((_) => []);
      const bounds = new mapboxgl.LngLatBounds();
      const lineFeatures: GeoJSON.Feature[] = [];

      // Group data by coordinates
      const groupedData = filteredData.reduce((acc, el) => {
        if (el.GR && el.GR.length > 0) {
          const coordinates = convertGRToDecimal(el.GR);
          if (!isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
            const key = `${coordinates[0]},${coordinates[1]}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(el);
          }
        }
        return acc;
      }, {} as Record<string, typeof filteredData>);

      Object.entries(groupedData).forEach(([key, group]) => {
        const [lng, lat] = key.split(',').map(Number);
        const baseCoordinates: [number, number] = [lng, lat];

        // Create a central marker
        const centralMarkerElement = document.createElement("div");
        centralMarkerElement.className = "central-marker";
        const centralMarker = new mapboxgl.Marker(centralMarkerElement)
          .setLngLat(baseCoordinates)
          .addTo(map.current);
        markers.push(centralMarker);

        group.forEach((el, index) => {
          const angle = (index / group.length) * 2 * Math.PI;
          const radius = 0.0001 * Math.ceil(group.length / 8);
          const offsetLng = baseCoordinates[0] + radius * Math.cos(angle);
          const offsetLat = baseCoordinates[1] + radius * Math.sin(angle);

          const markerElement = document.createElement("div");
          markerElement.className = "marker";

          const markerIcon = document.createElement("div");
          markerIcon.className = "marker-icon";
          markerElement.appendChild(markerIcon);
          markerIcon.style.backgroundRepeat = "no-repeat";

          const markerInfo = document.createElement("div");
          markerInfo.className = "marker-info";
          markerInfo.innerHTML = `<h3>${el[legend as keyof xlsDataType]}</h3>`;
          markerInfo.style.backgroundColor = stringToColor(el.Name_);
          markerElement.appendChild(markerInfo);

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${el["IntUniqueNo" as keyof xlsDataType]}: ${el["IntContent" as keyof xlsDataType]} </h3>
            <a href="/profile/${el.UID}" target="_blank">View Profile</a>`
          );

          const marker = new mapboxgl.Marker({
            element: markerElement,
          })
            .setLngLat([offsetLng, offsetLat])
            .setPopup(popup)
            .addTo(map.current);

          markers.push(marker);

          // Create a line feature
          const lineFeature: GeoJSON.Feature = {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [baseCoordinates, [offsetLng, offsetLat]]
            },
            properties: {}
          };
          lineFeatures.push(lineFeature);

          bounds.extend(baseCoordinates);

          const newKmlData = {
            name: el[legend as keyof xlsDataType],
            longitude: offsetLng,
            latitude: offsetLat,
          } as kmlDataType;
          setkmlData((prev: kmlDataType[]) => [...prev, newKmlData]);
        });
      });

      // Remove existing layer and source if they exist
      if (map.current.getLayer(lineLayerId)) {
        map.current.removeLayer(lineLayerId);
      }
      if (map.current.getSource(lineLayerId)) {
        map.current.removeSource(lineLayerId);
      }

      // Add a custom layer for lines
      map.current.addSource(lineLayerId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: lineFeatures
        }
      });

      map.current.addLayer({
        id: lineLayerId,
        type: 'line',
        source: lineLayerId,
        paint: {
          'line-color': '#888',
          'line-width': 2
        }
      });

      map.current.fitBounds(bounds, { padding: 50 });
    };

    if (filteredData.length !== 0 && showLayer.marker) {
      createMarkers();
    }

    return () => {
      markers.forEach((marker) => marker.remove());
      if (map.current.getLayer(lineLayerId)) {
        map.current.removeLayer(lineLayerId);
      }
      if (map.current.getSource(lineLayerId)) {
        map.current.removeSource(lineLayerId);
      }
    };
  }, [filteredData, legend, showLayer.marker]);

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