import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import WaterImpact from './pages/WaterImpact';
import Energy from './pages/Energy';
import Departments from './pages/Departments';
import Hostels from './pages/Hostels';
import Optimization from './pages/Optimization';
import Methodology from './pages/Methodology';
import Privacy from './pages/Privacy';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/water-impact" element={<WaterImpact />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/hostels" element={<Hostels />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
