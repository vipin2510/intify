import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode>
<GoogleOAuthProvider clientId="634705797878-g989aieoamebdm6ietcp5qlj8n6pvilu.apps.googleusercontent.com">
<App />
</GoogleOAuthProvider>
</React.StrictMode>,
);
