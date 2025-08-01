import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  className = '',
  padding = 'p-6',
  radius = 'rounded-3xl',
  shadow = 'shadow-xl',
  border = 'border border-gray-100',
  ...props
}) => (
  <div
    className={`bg-white ${radius} ${shadow} ${border} ${padding} ${className}`}
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
};

export default Card;
