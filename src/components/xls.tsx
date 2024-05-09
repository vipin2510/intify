import { useEffect } from "react";
import * as XLSX from 'xlsx';
import mapboxgl from 'mapbox-gl';
import axios from "axios";
import { stringToColor } from "@/lib/utils";

export const XLS = ({ data, setData, legend, setkmlData, setXlsData, map }: XLSProps) => {
    const parseDMS = (dms: string): number => {
        const regex = /(\d+)\s*°\s*(\d+)\s*'\s*(\d+(?:\.\d+)?)\s*"/; // Regex to match degrees, minutes, and seconds
        const match = dms.match(regex);
        if (!match) {
            console.error("Invalid DMS string:", dms);
            return NaN;
        }
        const degrees = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseFloat(match[3]);
        return degrees + (minutes / 60) + (seconds / 3600);
    };

    const dmsToDecimal = (dms: string, direction: string): number => {
        const decimal = parseDMS(dms);
        if (isNaN(decimal)) {
            console.error("Invalid DMS string:", dms);
            return NaN;
        }
        if (direction === "S" || direction === "W") {
            return -decimal; // For south or west directions, make the decimal negative
        }
        return decimal;
    };

    const convertGRToDecimal = (gr: string): [number, number] => {
        let decimal = gr.trim().split("  ");
        const [lat, lon] = decimal.map(el => parseFloat(el.trim().substring(0, el.length - 2)));
        if (!isNaN(lat) && !isNaN(lon))
            return [lon, lat];
        const regex = /(\d+°\s*\d+'\s*\d+(?:\.\d+)?"\s*[NS])\s+(\d+°\s*\d+'\s*\d+(?:\.\d+)?"\s*[EW])/;
        const match = gr.match(regex);
        if (!match) {
            console.error("Invalid GR string:", gr);
            return [NaN, NaN];
        }
        const latitudeDMS = match[1];
        const longitudeDMS = match[2];
        const latitudeDirection = latitudeDMS.slice(-1);
        const longitudeDirection = longitudeDMS.slice(-1);
        const latitude = dmsToDecimal(latitudeDMS, latitudeDirection);
        const longitude = dmsToDecimal(longitudeDMS, longitudeDirection);
        return [longitude, latitude];
    };


    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            // Handle case when no file is selected
            return;
        }

        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            if (!e.target || !e.target.result) {
                // Handle case when there's no result from reading the file
                return;
            }

            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            // const sheetName = workbook.SheetNames[2];
            const sheet = workbook.Sheets['Int Main Sheet'];
            const mapKeys = (data: any[]): xlsDataType[] => {
                return data.map(item => {
                    const mappedItem: Partial<xlsDataType> = {};
                    for (const key in item) {
                        if (key === 'Police Station') {
                            mappedItem['PoliceStation'] = item[key];
                        }
                        else if (key === 'Area Committee') {
                            mappedItem['AreaCommittee'] = item[key];
                        }
                        else if (key === 'Int Unique No') {
                            mappedItem['IntUniqueNo'] = item[key];
                        }
                        else if (key === 'Int Content') {
                            mappedItem['IntContent'] = item[key];
                        }
                        else if (key === '....') {
                            mappedItem['Date'] = item[key];
                        } else {
                            mappedItem[key as keyof xlsDataType] = item[key];
                        }
                    }
                    return mappedItem as xlsDataType;
                });
            };

            // Inside your file reading logic
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            const mappedData = mapKeys(jsonData);
            setData(mappedData);
            setXlsData(mappedData);
        };

        reader.onerror = (e) => {
            // Handle error during file reading
            console.error('Error reading file:', e);
        };

        reader.readAsArrayBuffer(file);
    };

    useEffect(() => {
        const markers: mapboxgl.Marker[] = [];  // Array to store marker instances
        const createMarkers = () => {
            setkmlData(_ => []);
            // Create an empty mapboxgl bounds object
            const bounds = new mapboxgl.LngLatBounds();

            // Loop through each coordinate in the array
            data.forEach(el => {
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
                        // if (legend === 'Date') {
                        //     if (typeof el.Date === 'number' && !isNaN(el.Date)) {
                        //         const startDate = new Date(1900, 0, 1); // January is 0-based
                        //         const date = new Date(startDate.getTime() + (el.Date - 1) * 24 * 60 * 60 * 1000);
                        //         markerInfo.innerHTML = `<h3>${date.toLocaleDateString('en-GB')}</h3>`;
                        //     } else {
                        //         console.log("Date is not a valid number");
                        //     }


                        // } else {
                        markerInfo.innerHTML = `<h3>${el[legend as keyof xlsDataType]}</h3>`;
                        markerInfo.style.backgroundColor = stringToColor(el.Name_);
                        markerInfo.style.position = "absolute"
                        markerInfo.style.left = "0";
                        markerInfo.style.maxWidth = "200px";
                        markerInfo.style.color = "#333";
                        markerInfo.style.padding = "6px";
                        markerInfo.style.borderRadius = "6px";
                        markerInfo.style.width="max-content";
                        markerInfo.style.fontSize = "12px";
                        markerInfo.style.boxShadow = "0 0 4px rgba(0, 0, 0, 0.05)"
                        // }
                        markerElement.appendChild(markerInfo);
                                                // Create popup
                                                const popup = new mapboxgl.Popup({ offset: 25 })
                                                .setHTML(`<h3>${el["IntContent" as keyof xlsDataType]}</h3>`);
                    

                        const marker = new mapboxgl.Marker({
                            element: markerElement
                        })
                            .setLngLat(coordinates)
                            .setPopup(popup) // 
                            .addTo(map.current);
                        markers.push(marker); // Add marker to markers array

                        // Extend the bounds to include each coordinate
                        bounds.extend(coordinates);

                        const newKmlData = { name: el[legend as keyof xlsDataType], longitude: coordinates[0], latitude: coordinates[1] } as kmlDataType;
                        setkmlData((prev: kmlDataType[]) => [...prev, newKmlData]); // Update kmlData directly with new state
                    }
                }
            });
            // Fit the map to the bounds
            map.current.fitBounds(bounds, { padding: 50 });
        };

        if (data.length !== 0) {
            console.log(data)
            createMarkers();
        }

        // Remove previous markers after new markers have been created
        return () => {
            markers.forEach(marker => {
                marker.remove();
            });
        };
    }, [data, legend]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get("https://sheetdb.io/api/v1/1s3s2lkndkhr4?sheet=Int%20Main%20Sheet");
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
        fetchData();
    }, []);

    return (
        <>
            <label htmlFor="xls-file" className='absolute hidden top-4 left-4 p-2 px-3 z-10 bg-blue-500 text-white rounded'>Import Excel</label>
            <input id='xls-file' type='file' onChange={handleFile} className='hidden' />
        </>
    );
};