export const parseDMS = (dms: string): number => {
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

export const dmsToDecimal = (dms: string, direction: string): number => {
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

export const convertGRToDecimal = (gr: string): [number, number] => {
    let decimal = gr.trim().split("  ");
    const [lat, lon] = decimal.map(el => parseFloat(el.trim().substring(0, el.length - 2)));

    if (!isNaN(lat) && !isNaN(lon)) {
        return [lon, lat];
    }
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