import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthContextProvider } from './context/authContext'; // ✅ Import the correct provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider> {/* ✅ Use AuthContextProvider instead */}
      <App />
    </AuthContextProvider>
  </React.StrictMode>
);

reportWebVitals();
