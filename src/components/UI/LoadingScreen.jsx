import React from 'react';
import { CSS_CLASSES, LOADING_MESSAGES } from '../../config/app';

const LoadingScreen = ({ userLoading = false }) => {
  return (
    <div className={CSS_CLASSES.LOADING_CONTAINER}>
      <div className={CSS_CLASSES.LOADING_TEXT}>
        <div className={CSS_CLASSES.LOADING_TITLE}>
          {LOADING_MESSAGES.GENERAL_LOADING}
        </div>
        <div className={CSS_CLASSES.LOADING_SUBTITLE}>
          {userLoading
            ? LOADING_MESSAGES.PROFILE_LOADING
            : LOADING_MESSAGES.AUTH_CHECK}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;