import React from 'react';
import PropTypes from 'prop-types';

const Toast = ({
  show,
  message,
  type = 'success',
  className = '',
  ...props
}) => {
  if (!show) return null;
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-xl font-semibold text-lg ${type === 'success' ? 'bg-white border border-green-200 text-green-700' : 'bg-white border border-red-200 text-red-700'} ${className}`}
      role="status"
      aria-live="polite"
      {...props}
    >
      <span>{message}</span>
    </div>
  );
};

Toast.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']),
  className: PropTypes.string,
};

export default Toast;
