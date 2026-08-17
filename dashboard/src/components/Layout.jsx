import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import DemoModeBanner from './DemoModeBanner';
import { isDemoMode } from '../api';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isDemo, setIsDemo] = React.useState(isDemoMode());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsDemo(isDemoMode());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/', label: 'Overview', icon: '📊' },
    { path: '/water-impact', label: 'Water Impact', icon: '💧' },
    { path: '/energy', label: 'Energy', icon: '⚡' },
    { path: '/sectors', label: 'Sectors', icon: '🏢' },
    { path: '/regions', label: 'Regions', icon: '🏠' },
    { path: '/optimization', label: 'Optimization', icon: '🎯' },
    { path: '/methodology', label: 'Methodology', icon: '🔬' },
    { path: '/privacy', label: 'Privacy', icon: '🔒' },
  ];

  return (
    <div className="layout">
      <DemoModeBanner />
      <div className="layout-container">
        <aside className="sidebar glass-card">
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">💧</span>
              <h1 className="text-gradient">NeerAI</h1>
            </div>
            <p className="tagline">India AI Sustainability</p>
          </div>
          
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="sidebar-footer">
            <div className="status-indicator">
              <span className={`status-dot ${isDemo ? 'demo' : 'live'}`}></span>
              <span className="status-text">{isDemo ? 'Demo Mode Active' : 'Live Data Sync'}</span>
            </div>
          </div>
        </aside>
        
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
