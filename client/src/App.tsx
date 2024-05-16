import { useState } from 'react';
import { useRef } from 'react';
import { Map } from '@/components/map';
import { XLS } from '@/components/xls';
import { KmlGenerator } from '@/components/kml-generator';
import { Filters } from '@/components/filters';
import { Toaster } from './components/ui/sonner';
import { Layer } from './components/layer';
import { RouteManager } from './components/RouteManager';

const App = () => {
  const map = useRef(null);
  const [data, setData] = useState<xlsDataType[]>([]);
  const [kmlData, setkmlData] = useState<kmlDataType[]>([]);
  const [xlsData, setXlsData] = useState<xlsDataType[]>([]);
  const [legend, setLegend] = useState<string>("Name");
  const [showLayer, setShowLayer] = useState<showLayerType>({ marker: true, border: false });
  const [selectedFilters, setSelectedFilters] = useState<selectedFiltersType>({});
  const [removeUnknown, setRemoveUnknown] = useState<boolean>(false);

  const handleChange = (type: keyof showLayerType) => {
    setShowLayer(prev => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <main className='flex flex-col h-screen'>
      <div className='absolute top-0 left-0 bg-white m-4 z-10 p-2 px-3 rounded-lg flex flex-col gap-y-2'>
        <div className='flex gap-x-2'>
          <input onChange={() => handleChange('marker')} type="checkbox" id='enable-markers' checked={showLayer.marker} />
          <label htmlFor="enable-markers" className='text-sm'>Markers</label>
        </div>
        <div className='flex gap-x-2'>
          <input onChange={() => handleChange('border')} type="checkbox" id='enable-border' checked={showLayer.border} />
          <label htmlFor="enable-border" className='text-sm'>Borders</label>
        </div>
      </div>
      <XLS showLayer={showLayer} map={map} legend={legend} data={data} setData={setData} setXlsData={setXlsData} setkmlData={setkmlData} removeUnknown={removeUnknown} setRemoveUnknown={setRemoveUnknown} />
      <KmlGenerator kmlData={kmlData} legendName={legend} selectedFilters={selectedFilters} removeUnknown={removeUnknown} />
      <Map map={map} />
      <Filters data={data} legend={legend} setLegend={setLegend} xlsData={xlsData} setData={setData} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} removeUnknown={removeUnknown} />
      <Layer showLayer={showLayer} map={map} />
      <Toaster position='top-center' />
      <RouteManager data={data} map={map} />
    </main>
  );
};

export default App;