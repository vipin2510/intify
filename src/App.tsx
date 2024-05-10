import { useState } from 'react';
import { useRef } from 'react';
import { Map } from '@/components/map';
import { XLS } from '@/components/xls';
import { KmlGenerator } from '@/components/kml-generator';
import { Filters } from '@/components/filters';
import { Toaster } from './components/ui/sonner';
import { Layer } from './components/layer';

const App = () => {
  const map = useRef(null);
  const [data, setData] = useState<xlsDataType[]>([]);
  const [kmlData, setkmlData] = useState<kmlDataType[]>([]);
  const [xlsData, setXlsData] = useState<xlsDataType[]>([]);
  const [legend, setLegend] = useState<string>("Name");
  const [showLayer, setShowLayer] = useState<showLayerType>({ marker: true, border: false });

  return (
    <main className='flex flex-col h-screen'>
      <div className='absolute top-0 left-0 bg-white m-4 z-10 p-2 px-3 rounded-lg flex flex-col gap-y-2'>
        <div className='flex gap-x-2'>
          <input type="checkbox" id='enable-markers' onClick={() => setShowLayer({ ...showLayer, marker: !showLayer.marker })} checked={showLayer.marker} />
          <label htmlFor="enable-markers" className='text-sm'>Markers</label>
        </div>
        <div className='flex gap-x-2'>
          <input type="checkbox" id='enable-border' onClick={() => setShowLayer({ ...showLayer, border: !showLayer.border })} checked={showLayer.border} />
          <label htmlFor="enable-border" className='text-sm'>Borders</label>
        </div>
      </div>
      <XLS showLayer={showLayer} map={map} legend={legend} data={data} setData={setData} setXlsData={setXlsData} setkmlData={setkmlData} />
      <KmlGenerator kmlData={kmlData} />
      <Map map={map} />
      <Filters data={data} legend={legend} setLegend={setLegend} xlsData={xlsData} setData={setData} />
      <Layer showLayer={showLayer} map={map} />
      <Toaster position='top-center' />
    </main>
  );
};

export default App;