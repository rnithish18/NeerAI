import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import WaterImpact from './pages/WaterImpact';
import Energy from './pages/Energy';
import Sectors from './pages/Sectors';
import Regions from './pages/Regions';
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
          <Route path="/sectors" element={<Sectors />} />
          <Route path="/regions" element={<Regions />} />
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
