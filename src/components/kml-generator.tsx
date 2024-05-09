import { saveAs } from 'file-saver';

export const KmlGenerator = ({ kmlData }: KmlGeneratorProps) => {

  const handleDownloadKML = () => {
    const kml = generateKML(kmlData);
    const blob = new Blob([kml], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'markers.kml');
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