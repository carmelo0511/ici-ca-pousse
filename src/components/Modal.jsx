import React from 'react';

const Modal = ({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-3xl shadow-2xl border border-gray-200 relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col items-center justify-center mx-auto ${className}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
          aria-label="Fermer la modale"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="w-full h-full overflow-y-auto flex-1 pr-2">{children}</div>
      </div>
    </div>
  );
};

export default Modal; 