import { saveAs } from 'file-saver';
import { useAppStore } from '@/store/useAppStore';

export const KmlGenerator = () => {
  const { generateKmlFromGeojson, selectedFilters, legend } = useAppStore();
  
  const handleDownloadKML = () => {
    // Generate KML data from stored GeoJSON
    const kmlData = generateKmlFromGeojson();
    
    if (kmlData.length === 0) {
      alert('No data available to generate KML');
      return;
    }
    
    const kml = generateKML(kmlData);
    const selectedFiltersString = Object.entries(selectedFilters)
      .filter(([key]) => key !== 'startDate' && key !== 'endDate') // Exclude startDate and endDate
      .map(([key, value]) => `${key}=${value}`)
      .join('_');

    const startDateString = selectedFilters.startDate ? `_startDate=${selectedFilters.startDate.toString()}` : '';
    const endDateString = selectedFilters.endDate ? `_endDate=${selectedFilters.endDate.toString()}` : '';

    const fileName = `kml_${selectedFiltersString}${startDateString}${endDateString}_legend=${legend}.kml`;
    const blob = new Blob([kml], { type: 'text/plain;charset=utf-8' });

    saveAs(blob, fileName);
  };

  const generateKML = (markers: kmlDataType[]) => {
    console.log('Markers:', markers);
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
          <kml xmlns="http://www.opengis.net/kml/2.2">
          <Document>
          `;
    markers.forEach(marker => {
      const { longitude, latitude, name } = marker;
      kml += `
            <Placemark>
              <name>${name}</name>
              <Point>
                <coordinates>${longitude},${latitude}</coordinates>
              </Point>
            </Placemark>
          `;
    });

    kml += `
          </Document>
          </kml>
        `;

    return kml;
  };

  return (
    <button onClick={handleDownloadKML} className='bg-orange-500 text-white text-sm p-2 px-3 absolute z-10 right-4 top-4 rounded-md'>Generate KML</button>
  );
};