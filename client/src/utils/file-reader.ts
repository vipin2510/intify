import * as XLSX from 'xlsx';

export const handleFile = (event: React.ChangeEvent<HTMLInputElement>, setData: (data: xlsDataType[]) => void, setXlsData: (data: xlsDataType[]) => void) => {
    const file = event.target.files?.[0];
    if (!file) {
        // Case when no file is selected
        return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
        if (!e.target || !e.target.result) {
            // Case when there's no result from reading the file
            return;
        }

        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets['Int Main Sheet'];

        // Mapping fields that contain spaces
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

        // conversion to json
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const mappedData = mapKeys(jsonData);
        setData(mappedData);
        setXlsData(mappedData);
    };

    reader.onerror = (e) => {
        // Error during file reading
        console.error('Error reading file:', e);
    };

    reader.readAsArrayBuffer(file);
};