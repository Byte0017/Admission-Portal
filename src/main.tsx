import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastContainer position="top-right" autoClose={3000} />
    <App />
  </React.StrictMode>
);
