import { useEffect } from "react";
import mapboxgl from 'mapbox-gl';
import axios from "axios";
import { stringToColor } from "@/lib/utils";
import { convertGRToDecimal } from '@/utils/conversion';
import { handleFile } from "@/utils/file-reader";

export const XLS = ({ showLayer, data, setData, legend, setkmlData, setXlsData, map, removeUnknown, setRemoveUnknown }: XLSProps) => {

    useEffect(() => {

        // Array to store marker instances
        const markers: mapboxgl.Marker[] = [];

        // Function of creating markers with specific colors generated
        const createMarkers = () => {
            setkmlData(_ => []);
            // Create an empty mapboxgl bounds object
            const bounds = new mapboxgl.LngLatBounds();
            const filteredData = removeUnknown
                ? data.filter(el => el[legend as keyof xlsDataType] !== "Unknown")
                : data;
            // Loop through each coordinate in the array
            filteredData.forEach(el => {
                // Create a marker for each coordinate
                if (el.GR && el.GR.length > 0) {
                    const coordinates = convertGRToDecimal(el.GR) as [number, number];
                    // Extend the bounds to include each coordinate
                    if (!isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
                        const markerElement = document.createElement('div');
                        markerElement.className = 'marker';

                        // Create marker icon
                        const markerIcon = document.createElement('div');
                        markerIcon.className = 'marker-icon';
                        markerElement.appendChild(markerIcon);
                        markerIcon.style.backgroundRepeat = 'no-repeat';

                        // Create marker info
                        const markerInfo = document.createElement('div');

                        markerInfo.className = 'marker-info';
                        markerInfo.innerHTML = `<h3>${el[legend as keyof xlsDataType]}</h3>`;

                        // Generating specific colors according to Name_ field
                        markerInfo.style.backgroundColor = stringToColor(el.Name_);

                        markerElement.appendChild(markerInfo);

                        // Creating popup
                        const popup = new mapboxgl.Popup({ offset: 25 })
                            .setHTML(`<h3>${el["IntUniqueNo" as keyof xlsDataType]}: ${el["IntContent" as keyof xlsDataType]} </h3>`);

                        const marker = new mapboxgl.Marker({
                            element: markerElement
                        })
                            .setLngLat(coordinates)
                            .setPopup(popup)
                            .addTo(map.current);

                        markers.push(marker);

                        // Extend the bounds to include each coordinate
                        bounds.extend(coordinates);

                        // Generating kml according to the filterd or initial data
                        const newKmlData = { name: el[legend as keyof xlsDataType], longitude: coordinates[0], latitude: coordinates[1] } as kmlDataType;
                        setkmlData((prev: kmlDataType[]) => [...prev, newKmlData]);
                    }
                }
            });

            // Fit the map to the bounds
            map.current.fitBounds(bounds, { padding: 50 });
        };

        if (data.length !== 0 && showLayer.marker) {
            createMarkers();
        }

        // Removing previous markers after new markers have been created
        return () => {
            markers.forEach(marker => {
                marker.remove();
            });
        };
    }, [data, legend, showLayer.marker, removeUnknown]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get("https://sheetdb.io/api/v1/zbqakzbdg0rah?sheet=Int%20Main%20Sheet");
            const processedData = res.data.map((item: any) => ({
                Date: item.Date,
                IntContent: item['Int Content'],
                Name: item.Name,
                Name_: item.Name_,
                IntUniqueNo: parseInt(item['Int Unique No']),
                GR: item.GR,
                Strength: parseInt(item.Strength),
                Source: item.Source,
                Type: item.Type,
                Rank: item.Rank,
                AreaCommittee: item['Area Committee'],
                District: item.District,
                PoliceStation: item['Police Station'],
                Division: item.Division,
                Week: parseInt(item.Week),
                Month: parseInt(item.Month),
            }));
            setData(processedData);
            setXlsData(processedData);
        }
        showLayer.marker && fetchData();
    }, [showLayer.marker]);

    return (
        <>
            <label htmlFor="xls-file" className='absolute hidden top-4 left-4 p-2 px-3 z-10 bg-blue-500 text-white rounded'>Import Excel</label>
            <input id='xls-file' type='file' onChange={event => handleFile(event, setData, setXlsData)} className='hidden' />
            <button
                onClick={() => setRemoveUnknown(!removeUnknown)}
                className="absolute top-16 right-4 p-2 px-3 z-10 bg-red-500 text-white rounded"
            >
                {removeUnknown ? "Include Unknown" : "Remove Unknown"}
            </button>
        </>
    );
};