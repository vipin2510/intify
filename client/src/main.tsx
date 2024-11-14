import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode>
<GoogleOAuthProvider clientId="20470304601-qheou005agkgg61ab2a36amrkbdm846t.apps.googleusercontent.com">
<App />
</GoogleOAuthProvider>
</React.StrictMode>,
);
