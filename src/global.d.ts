type xlsDataType = {
    Date: Date | null;
    IntContent: String;
    Name: string;
    Name_: string;
    IntUniqueNo: number;
    GR: string;
    Strength: number;
    Source: string;
    Type: string;
    Rank: string;
    AreaCommittee: string;
    District: string;
    PoliceStation: string;
    Division: string;
    Week: number;
    Month: number;
};
type kmlDataType = {
    name: string;
    latitude: number;
    longitude: number;
}

interface FiltersProps {
    legend: string;
    setLegend: (data: string) => void;
    data: xlsDataType[];
    setData: (data: xlsDataType[]) => void;
    xlsData: xlsDataType[];
};
interface KmlGeneratorProps {
    kmlData: kmlDataType[];
};
interface XLSProps {
    legend: string;
    data: xlsDataType[];
    setData: (data: xlsDataType[]) => void;
    setkmlData: (update: (prev: kmlDataType[]) => kmlDataType[]) => void;
    setXlsData: (data: xlsDataType[]) => void;
    map: any;
};
interface MapProps {
    map: any;
}