import { saveAs } from 'file-saver';

export const KmlGenerator = ({ kmlData, selectedFilters, legendName,removeUnknown }: KmlGeneratorProps) => {
  const handleDownloadKML = () => {
    const filteredKmlData = removeUnknown
    ? kmlData.filter(item => item.name !== "Unknown")
    : kmlData;
    const kml = generateKML(filteredKmlData);
    const selectedFiltersString = Object.entries(selectedFilters)
      .filter(([key]) => key !== 'startDate' && key !== 'endDate') // Exclude startDate and endDate
      .map(([key, value]) => `${key}=${value}`)
      .join('_');
    const startDateString = selectedFilters.startDate ? `_startDate=${selectedFilters.startDate.toString()}` : '';
    const endDateString = selectedFilters.endDate ? `_endDate=${selectedFilters.endDate.toString()}` : '';
    const fileName = `kml_${selectedFiltersString}${startDateString}${endDateString}_legend=${legendName}.kml`;
    const blob = new Blob([kml], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, fileName);
  };

  const generateKML = (markers: kmlDataType[]) => {
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
    <button onClick={handleDownloadKML} className='bg-orange-500 text-white p-2 px-3 absolute z-10 right-4 top-4 rounded-md'>Generate KML</button>
  );
};