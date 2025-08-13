import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  children,
  className = '',
  maxWidth = 'max-w-lg',
  padding = '',
  radius = '',
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
      className="fixed inset-0 z-50 flex items-stretch modal-backdrop p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`modal relative w-full ${maxWidth} max-h-[90vh] flex flex-col items-stretch mx-auto p-2 sm:p-6 overflow-y-auto ${className}`}
        {...props}
      >
        <button
          onClick={onClose}
          className="btn-secondary absolute -top-2 right-2 sm:-top-1 sm:right-4 z-10 p-1"
          aria-label="Fermer la modale"
        >
          <X className="h-4 w-4" />
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
