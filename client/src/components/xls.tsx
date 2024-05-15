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
        "https://intify-server.vercel.app/api/spreadsheet",
      );
      const rows = res.data;
      rows.shift();
      console.log(rows[0]);
      const processedData = rows.map((row) => ({
        Date: row[0],
        IntContent: row[2],
        Name: row[4],
        Name_: row[3],
        IntUniqueNo: parseInt(row[1]),
        GR: row[5],
        Strength: parseInt(row[6]),
        // 7 is for int confidence please ignore
        Source: row[8],
        Type: row[9],
        Rank: row[10],
        AreaCommittee: row[11],
        District: row[12],
        PoliceStation: row[13],
        Division: row[15],
        Week: parseInt(row[16]),
        Month: parseInt(row[17]),
      }));
      console.log(processedData[2].Name);
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
    // Array to store marker instances
    const markers: mapboxgl.Marker[] = [];

    // Function of creating markers with specific colors generated
    const createMarkers = () => {
      setkmlData((_) => []);
      // Create an empty mapboxgl bounds object
      const bounds = new mapboxgl.LngLatBounds();

      // Loop through each coordinate in the array
      filteredData.forEach((el) => {
        // Create a marker for each coordinate
        if (el.GR && el.GR.length > 0) {
          const coordinates = convertGRToDecimal(el.GR) as [number, number];
          // Extend the bounds to include each coordinate
          if (!isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
            const markerElement = document.createElement("div");
            markerElement.className = "marker";

            // Create marker icon
            const markerIcon = document.createElement("div");
            markerIcon.className = "marker-icon";
            markerElement.appendChild(markerIcon);
            markerIcon.style.backgroundRepeat = "no-repeat";

            // Create marker info
            const markerInfo = document.createElement("div");

            markerInfo.className = "marker-info";
            markerInfo.innerHTML = `<h3>${el[legend as keyof xlsDataType]}</h3>`;

            // Generating specific colors according to Name_ field
            markerInfo.style.backgroundColor = stringToColor(el.Name_);

            markerElement.appendChild(markerInfo);

            // Creating popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<h3>${el["IntUniqueNo" as keyof xlsDataType]}: ${el["IntContent" as keyof xlsDataType]} </h3>`,
            );

            const marker = new mapboxgl.Marker({
              element: markerElement,
            })
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current);

            markers.push(marker);

            // Extend the bounds to include each coordinate
            bounds.extend(coordinates);

            // Generating kml according to the filterd or initial data
            const newKmlData = {
              name: el[legend as keyof xlsDataType],
              longitude: coordinates[0],
              latitude: coordinates[1],
            } as kmlDataType;
            setkmlData((prev: kmlDataType[]) => [...prev, newKmlData]);
          }
        }
      });

      // Fit the map to the bounds
      map.current.fitBounds(bounds, { padding: 50 });
    };

    if (filteredData.length !== 0 && showLayer.marker) {
      createMarkers();
    }

    // Removing previous markers after new markers have been created
    return () => {
      markers.forEach((marker) => {
        marker.remove();
      });
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
        className="absolute top-16 right-4 p-2 px-3 z-10 bg-red-500 text-white rounded"
      >
        {removeUnknown ? "Include Unknown" : "Remove Unknown"}
      </button>
    </>
  );
};
