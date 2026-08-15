import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import DemoModeBanner from './DemoModeBanner';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: '📊' },
    { path: '/water-impact', label: 'Water Impact', icon: '💧' },
    { path: '/energy', label: 'Energy', icon: '⚡' },
    { path: '/departments', label: 'Departments', icon: '🏢' },
    { path: '/hostels', label: 'Hostels', icon: '🏠' },
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
            <p className="tagline">VSB Engineering College</p>
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
              <span className="status-dot demo"></span>
              <span className="status-text">Demo Mode Active</span>
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
