import React from 'react';

const Toast = ({ show, message, type = 'success' }) => {
  if (!show) return null;
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-xl font-semibold text-lg
      ${type === 'success' ? 'bg-white border border-green-200 text-green-700' : 'bg-white border border-red-200 text-red-700'}`}
    >
      <span>{message}</span>
    </div>
  );
};

export default Toast; 