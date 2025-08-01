import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

const Modal = ({
  isOpen,
  onClose,
  children,
  className = '',
  maxWidth = 'max-w-lg',
  padding = 'p-6',
  radius = 'rounded-3xl',
  ariaLabel = 'Modal',
  ...props
}) => {
  const modalRef = useRef(null);
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch bg-black/50 backdrop-blur-sm p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`bg-white ${radius} shadow-2xl border border-gray-200 relative w-full ${maxWidth} max-h-[90vh] flex flex-col items-center justify-center mx-auto p-2 sm:p-6 overflow-y-auto ${className}`}
        {...props}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Fermer la modale"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="w-full h-full overflow-y-auto flex-1 min-h-0 pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxWidth: PropTypes.string,
  padding: PropTypes.string,
  radius: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Modal;
