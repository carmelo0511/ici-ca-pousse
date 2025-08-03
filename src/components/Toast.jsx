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
      className={`toast-notification font-semibold text-lg ${type === 'success' ? 'badge-success' : 'badge-danger'} ${className}`}
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
