import React from 'react';

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm' }) => {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal confirm-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-icon" onClick={onCancel} style={{ fontSize: 18 }}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-2)', lineHeight: 1.75 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
