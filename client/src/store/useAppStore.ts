import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export type xlsDataType = {
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
  UID: string;
};

export type kmlDataType = {
  name: string;
  latitude: number;
  longitude: number;
};

export type showLayerType = {
  marker: boolean;
  border: boolean;
};

export type selectedFiltersType = Partial<xlsDataType> & { 
  startDate?: Date; 
  endDate?: Date; 
};

export type GeoJSONFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    legend: string;
    uid: string;
    intUniqueNo: number;
    intContent: string;
    color: string;
    markerType?: string;
  };
};

export type GeoJSONData = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
};

// Store interface
interface AppState {
  // Data states
  data: xlsDataType[];
  kmlData: kmlDataType[];
  xlsData: xlsDataType[];
  filteredData: xlsDataType[];
  geojsonData: GeoJSONData | null;
  
  // UI states
  legend: string;
  showLayer: showLayerType;
  selectedFilters: Record<string, (string | Date)[]>;
  removeUnknown: boolean;
  
  // Authentication states
  isAuthenticated: boolean;
  errorMessage: string | null;
  userEmail: string | null;
  showMenu: boolean;
  
  
  // Actions
  setData: (data: xlsDataType[]) => void;
  setKmlData: (data: kmlDataType[]) => void;
  setXlsData: (data: xlsDataType[]) => void;
  setFilteredData: (data: xlsDataType[]) => void;
  setGeojsonData: (data: GeoJSONData | null) => void;
  
  setLegend: (legend: string) => void;
  setShowLayer: (showLayer: showLayerType) => void;
  updateShowLayer: (type: keyof showLayerType) => void;
  setSelectedFilters: (filters: Record<string, (string | Date)[]>) => void;
  setRemoveUnknown: (removeUnknown: boolean) => void;
  
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  setUserEmail: (userEmail: string | null) => void;
  setShowMenu: (showMenu: boolean) => void;
    
  // Utility actions
  resetState: () => void;
  generateKmlFromGeojson: () => kmlDataType[];
}

// Initial state
const initialState = {
  data: [],
  kmlData: [],
  xlsData: [],
  filteredData: [],
  geojsonData: null,
  legend: "Name",
  showLayer: {
    marker: true,
    border: false,
  },
  selectedFilters: {},
  removeUnknown: false,
  isAuthenticated: false,
  errorMessage: null,
  userEmail: null,
  showMenu: false,
  map: null,
};

// Create store
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Data setters
      setData: (data) => set({ data }),
      setKmlData: (kmlData) => set({ kmlData }),
      setXlsData: (xlsData) => set({ xlsData }),
      setFilteredData: (filteredData) => set({ filteredData }),
      setGeojsonData: (geojsonData) => set({ geojsonData }),
      
      // UI setters
      setLegend: (legend) => set({ legend }),
      setShowLayer: (showLayer) => set({ showLayer }),
      updateShowLayer: (type) => set((state) => ({
        showLayer: { ...state.showLayer, [type]: !state.showLayer[type] }
      })),
      setSelectedFilters: (selectedFilters) => set({ selectedFilters }),
      setRemoveUnknown: (removeUnknown) => set({ removeUnknown }),
      
      // Auth setters
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      setUserEmail: (userEmail) => set({ userEmail }),
      setShowMenu: (showMenu) => set({ showMenu }),
      
      
      // Utility actions
      resetState: () => set(initialState),
      
      // Generate KML data from GeoJSON
      generateKmlFromGeojson: () => {
        const { geojsonData } = get();
        if (!geojsonData) return [];
        
        return geojsonData.features.map((feature) => ({
          name: feature.properties.legend,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        }));
      },
    }),
    {
      name: 'app-store',
    }
  )
);
