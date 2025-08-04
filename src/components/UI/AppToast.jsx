import React from 'react';
import { CSS_CLASSES } from '../../config/app';

const AppToast = ({ toast }) => {
  if (!toast.show) return null;

  const toastClass = toast.type === 'success' 
    ? CSS_CLASSES.TOAST_SUCCESS 
    : CSS_CLASSES.TOAST_ERROR;

  return (
    <div className={`${CSS_CLASSES.TOAST_BASE} ${toastClass}`}>
      <span>{toast.message}</span>
    </div>
  );
};

export default AppToast;