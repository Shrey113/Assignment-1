import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DonorPage from './pages/DonorPage';
import RequesterPage from './pages/RequesterPage';
import AdminPage from './pages/AdminPage';
import OurAreaPage from './pages/OurAreaPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/donor" element={<DonorPage />} />
        <Route path="/requester" element={<RequesterPage />} />
        <Route path="/our-area" element={<OurAreaPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
