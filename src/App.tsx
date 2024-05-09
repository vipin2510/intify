import { useState } from 'react';
import { useRef } from 'react';
import { Map } from '@/components/map';
import { XLS } from '@/components/xls';
import { KmlGenerator } from '@/components/kml-generator';
import { Filters } from '@/components/filters';
import { Toaster } from './components/ui/sonner';

const App = () => {
  const map = useRef(null);
  const [data, setData] = useState<xlsDataType[]>([]);
  const [kmlData, setkmlData] = useState<kmlDataType[]>([]);
  const [xlsData, setXlsData] = useState<xlsDataType[]>([]);
  const [legend, setLegend] = useState<string>("Name");

  return (
    <main className='flex flex-col h-screen'>
      <XLS map={map} legend={legend} data={data} setData={setData} setXlsData={setXlsData} setkmlData={setkmlData} />
      <KmlGenerator kmlData={kmlData} />
      <Map map={map} />
      <Filters data={data} legend={legend} setLegend={setLegend} xlsData={xlsData} setData={setData} />
      <Toaster position='top-center' />
    </main>
  );
};

export default App;