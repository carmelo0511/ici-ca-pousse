import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  className = '',
  padding = '',
  radius = '',
  shadow = '',
  border = '',
  clickable = false,
  ...props
}) => (
  <div
    className={`card ${clickable ? 'ripple-effect' : ''} ${className}`}
    data-clickable={clickable ? 'true' : undefined}
    {...props}
  >
    {children}
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.string,
  radius: PropTypes.string,
  shadow: PropTypes.string,
  border: PropTypes.string,
  clickable: PropTypes.bool,
};

export default Card;
