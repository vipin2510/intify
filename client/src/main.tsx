import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode>
<GoogleOAuthProvider clientId="31972503524-c5ao35e1arcjb53ruskm8cpr36gm4dg5.apps.googleusercontent.com">
<App />
</GoogleOAuthProvider>
</React.StrictMode>,
);
