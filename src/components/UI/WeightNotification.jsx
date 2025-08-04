import React from 'react';
import { CSS_CLASSES } from '../../config/app';

const WeightNotification = ({ 
  show, 
  isFading, 
  onUpdateWeight, 
  onSameWeight 
}) => {
  if (!show) return null;

  return (
    <div
      className={`${CSS_CLASSES.WEIGHT_NOTIFICATION} ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className={CSS_CLASSES.WEIGHT_NOTIFICATION_TITLE}>
        Mise à jour du poids
      </div>
      <div className={CSS_CLASSES.WEIGHT_NOTIFICATION_TEXT}>
        C'est le début d'une nouvelle semaine !<br />
        Veux-tu mettre à jour ton poids ?
      </div>
      <div className={CSS_CLASSES.WEIGHT_NOTIFICATION_BUTTONS}>
        <button
          onClick={onUpdateWeight}
          className={CSS_CLASSES.WEIGHT_BUTTON_PRIMARY}
        >
          Mettre à jour
        </button>
        <button
          onClick={onSameWeight}
          className={CSS_CLASSES.WEIGHT_BUTTON_SECONDARY}
        >
          C'est le même
        </button>
      </div>
    </div>
  );
};

export default WeightNotification;