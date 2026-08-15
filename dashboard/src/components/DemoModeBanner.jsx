import React, { useState } from 'react';
import './DemoModeBanner.css';

const DemoModeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="demo-banner">
      <div className="demo-banner-content">
        <span className="warning-icon">⚠️</span>
        <p><strong>DEMONSTRATION DATA</strong> — Not real measurements. Values are synthetically generated for UI demonstration purposes only.</p>
      </div>
      <button className="demo-close-btn" onClick={() => setIsVisible(false)}>×</button>
    </div>
  );
};

export default DemoModeBanner;
