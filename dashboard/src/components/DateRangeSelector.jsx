import React from 'react';
import './DateRangeSelector.css';

const DateRangeSelector = ({ value = 30, onChange }) => {
  const options = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
  ];

  return (
    <div className="date-range-selector">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`date-range-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default DateRangeSelector;
