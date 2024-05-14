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
type selectedFiltersType = Partial<xlsDataType> & { startDate?: Date; endDate?: Date };

interface FiltersProps {
    legend: string;
    setLegend: (data: string) => void;
    data: xlsDataType[];
    setData: (data: xlsDataType[]) => void;
    xlsData: xlsDataType[];
    selectedFilters: selectedFiltersType;
    setSelectedFilters: (filters: selectedFiltersType) => void;
  };

  interface KmlGeneratorProps {
    kmlData: kmlDataType[];
    legendName: string;
    selectedFilters: selectedFiltersType;
    removeUnknown: boolean;
  }

interface XLSProps {
    legend: string;
    data: xlsDataType[];
    showLayer: showLayerType;
    setData: (data: xlsDataType[]) => void;
    setkmlData: (update: (prev: kmlDataType[]) => kmlDataType[]) => void;
    setXlsData: (data: xlsDataType[]) => void;
    map: any;
    removeUnknown: boolean;
    setRemoveUnknown: (value: boolean) => void;
};
interface LayerProps {
    showLayer: showLayerType;
    map: any;
}
interface MapProps {
    map: any;
}
type showLayerType = {
    marker: boolean;
    border: boolean;
}