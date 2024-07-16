import { useState, useRef, useEffect } from 'react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Map } from '@/components/map';
import { XLS } from '@/components/xls';
import { KmlGenerator } from '@/components/kml-generator';
import { Filters } from '@/components/filters';
import { Toaster } from './components/ui/sonner';
import { Layer } from './components/layer';
import { RouteManager } from './components/RouteManager';
import { AUTH_CONFIG } from './config';
import { Analytics } from "@vercel/analytics/react"

const App = () => {
  const map = useRef(null);
  const [data, setData] = useState<xlsDataType[]>([]);
  const [kmlData, setkmlData] = useState<kmlDataType[]>([]);
  const [xlsData, setXlsData] = useState<xlsDataType[]>([]);
  const [legend, setLegend] = useState<string>("Name");
  const [showLayer, setShowLayer] = useState<showLayerType>({ marker: true, border: false });
  const [selectedFilters, setSelectedFilters] = useState<selectedFiltersType>({});
  const [removeUnknown, setRemoveUnknown] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        let token;
        if ('access_token' in tokenResponse) {
          token = tokenResponse.access_token;
        } else if ('code' in tokenResponse) {
          console.error('Authorization code flow not implemented');
          setErrorMessage('Authorization code flow not implemented');
          return;
        } else {
          console.error('Unexpected token response');
          setErrorMessage('Unexpected token response');
          return;
        }

        const response = await fetch('https://intify-server.vercel.app/api/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          await response.json();
          localStorage.setItem('authToken', token);
          setIsAuthenticated(true);
          setErrorMessage(null);
        } else {
          const errorData = await response.json();
          console.error('Authentication failed:', errorData.error);
          setIsAuthenticated(false);
          setErrorMessage(errorData.error || 'You are unauthorized. Please contact the administrator.');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        setIsAuthenticated(false);
        setErrorMessage('An error occurred during authentication. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setIsAuthenticated(false);
      setErrorMessage('Login failed. Please try again.');
    },
    scope: 'email profile',
  });

  const handleChange = (type: keyof showLayerType) => {
    setShowLayer(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    setErrorMessage(null);
  };

  return (
    <GoogleOAuthProvider clientId={AUTH_CONFIG.GOOGLE_CLIENT_ID}>
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
          <button onClick={handleLogout} className='text-sm bg-red-500 text-white px-2 py-1 rounded'>Logout</button>
          <RouteManager data={data} map={map} />
        </div>
        <XLS showLayer={showLayer} map={map} legend={legend} data={data} setData={setData} setXlsData={setXlsData} setkmlData={setkmlData} removeUnknown={removeUnknown} setRemoveUnknown={setRemoveUnknown} />
        <KmlGenerator kmlData={kmlData} legendName={legend} selectedFilters={selectedFilters} removeUnknown={removeUnknown} />
        <Map map={map} />
        <Filters data={data} legend={legend} setLegend={setLegend} xlsData={xlsData} setData={setData} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} removeUnknown={removeUnknown} />
        <Layer showLayer={showLayer} map={map} />
        <Toaster position='top-center' />
        <Analytics />
        {!isAuthenticated && (
          <div className="z-[999] absolute w-screen h-screen backdrop-blur-md p-4 bg-black bg-opacity-50 flex flex-col justify-center items-center">
            <section className='bg-white p-4 md:gap-y-4 gap-y-2 lg:w-1/3 sm:w-1/2 w-full rounded-md flex flex-col justify-center items-center'>
              <h1 className='md:text-4xl text-2xl text-blue-500 font-[Viga] uppercase'>Intify</h1>
              <h3 className='md:text-lg text-red-500'>Only authorised People are allowed to access this website.Verify yourself by logging in through your allowed google account</h3>
              <button onClick={() => login()} className="bg-blue-500 text-white px-4 md:py-2 p-1 mt-2 rounded">
                Log in
              </button>
              {errorMessage && (
                <div className="text-red-500 text-center max-w-md text-sm">
                  {errorMessage}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </GoogleOAuthProvider>
  );
};

export default App;