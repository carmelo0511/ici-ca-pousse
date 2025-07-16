import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

export default Card; 