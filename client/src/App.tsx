import { useState, useRef, useEffect } from 'react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Map } from '@/components/map';
import { XLS } from '@/components/xls';
import { KmlGenerator } from '@/components/kml-generator';
import { Filters } from '@/components/filters';
import { Toaster } from './components/ui/sonner';
import { Layer } from './components/layer';
import { RouteManager } from './components/RouteManager';
import { NaxalProfile } from './components/NaxalProfile';
import { AUTH_CONFIG } from './config';
import { Analytics } from "@vercel/analytics/react"

const App = () => {
  const map = useRef(null);
  const [data, setData] = useState<xlsDataType[]>([]);
  const [kmlData, setkmlData] = useState<kmlDataType[]>([]);
  const [xlsData, setXlsData] = useState<xlsDataType[]>([]);
  const [legend, setLegend] = useState<string>("Name");
  const [showLayer, setShowLayer] = useState<showLayerType>({ marker: true, border: false });
  const [selectedFilters, setSelectedFilters] = useState<Record<string, (string | Date)[]>>({});
  const [removeUnknown, setRemoveUnknown] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false); // ✅ collapsible state
  

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      const email = localStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
        logUserActivity(email);
      }
    }
  }, []);

  const logUserActivity = async (email: string) => {
    try {
      await fetch('https://intify-server.vercel.app/api/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          lastDateOfAccess: new Date().toISOString(),
          timeStamp: Date.now(),
        }),
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        let token;
        if ('access_token' in tokenResponse) {
          token = tokenResponse.access_token;
        } else {
          setErrorMessage('Unexpected login response');
          return;
        }
        const response = await fetch('https://intify-server.vercel.app/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem('authToken', token);
          localStorage.setItem('userEmail', userData.email);
          setIsAuthenticated(true);
          setUserEmail(userData.email);
          setErrorMessage(null);
          logUserActivity(userData.email);
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.error || 'Unauthorized account.');
        }
      } catch (error) {
        setErrorMessage('Login failed. Try again.');
      }
    },
    onError: () => setErrorMessage('Login failed. Please retry.'),
    scope: 'email profile',
  });

  const handleChange = (type: keyof showLayerType) => {
    setShowLayer(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setErrorMessage(null);
  };

  return (
    <GoogleOAuthProvider clientId={AUTH_CONFIG.GOOGLE_CLIENT_ID}>
      <Router>
        <main className="flex flex-col h-screen">
          <Routes>
            <Route path="/" element={
              <>
                {/* ✅ Transparent floating control box */}
                <div className="absolute top-0 left-0 m-4 z-20 controls-box">
  <div className="flex gap-x-2">
    <input onChange={() => handleChange('marker')} type="checkbox" id="enable-markers" checked={showLayer.marker} />
    <label htmlFor="enable-markers" className="text-sm">Markers</label>
  </div>
  <div className="flex gap-x-2">
    <input onChange={() => handleChange('border')} type="checkbox" id="enable-border" checked={showLayer.border} />
    <label htmlFor="enable-border" className="text-sm">Borders</label>
  </div>

                  {/* ✅ collapsible section */}
                  <button 
                    onClick={() => setShowMenu(!showMenu)} 
                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded mt-2"
                  >
                    {showMenu ? "Hide Menu" : "Show Menu"}
                  </button>

                  {showMenu && (
                    <div className="flex flex-col gap-y-2 mt-2">
                      {isAuthenticated && (
                        <>
                          <p className="text-xs">Logged in as: {userEmail}</p>
                          <button onClick={handleLogout} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Logout</button>
                        </>
                      )}
                      <RouteManager data={data} map={map} />
                    </div>
                  )}
                </div>

                {/* Main components */}
                <XLS showLayer={showLayer} map={map} legend={legend} data={data} setData={setData} setXlsData={setXlsData} setkmlData={setkmlData} removeUnknown={removeUnknown} setRemoveUnknown={setRemoveUnknown} />
                <KmlGenerator kmlData={kmlData} legendName={legend} selectedFilters={selectedFilters} removeUnknown={removeUnknown} />
                <Map map={map} />
                <Filters data={data} legend={legend} setLegend={setLegend} xlsData={xlsData} setData={setData} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} removeUnknown={removeUnknown} />
                <Layer showLayer={showLayer} map={map} />
              </>
            } />
            <Route path="/profile/:uid" element={<NaxalProfile />} />
          </Routes>

          <Toaster position="top-center" />
          <Analytics />

          {/* ✅ Login overlay */}
          {!isAuthenticated && (
            <div className="z-[999] absolute w-screen h-screen backdrop-blur-md bg-black/60 flex flex-col justify-center items-center">
              <section className="bg-white/80 dark:bg-black/70 p-4 gap-y-3 lg:w-1/3 sm:w-1/2 w-full rounded-md flex flex-col justify-center items-center">
                <h1 className="md:text-4xl text-2xl text-blue-500 font-[Viga] uppercase">Intify</h1>
                <h3 className="md:text-lg text-red-500 text-center">Only authorised people are allowed. Verify by logging in with your Google account.</h3>
                <button onClick={() => login()} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
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
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
