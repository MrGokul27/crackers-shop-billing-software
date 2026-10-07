import React from 'react';

export default function KeyboardShortcutsModal({ onClose }) {
  const shortcuts = [
    { key: 'F2', desc: 'Focus Search / Barcode Bar' },
    { key: 'Enter', desc: 'Print Bill / Complete Sale (when cart has items)' },
    { key: 'F4', desc: 'Select CASH Payment Mode' },
    { key: 'F7', desc: 'Select UPI / QR Payment Mode' },
    { key: 'F8', desc: 'Select CARD Payment Mode' },
    { key: 'Esc', desc: 'Clear Search Bar or Close Modal' },
  ];

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 px-3">
            <h6 className="modal-title fw-bold">
              <i className="fa-solid fa-keyboard text-warning me-2"></i> Fast Keyboard Shortcuts
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3">
            <p className="small text-muted mb-2">Designed for fast counter billing:</p>
            <div className="list-group list-group-flush border rounded-3">
              {shortcuts.map(s => (
                <div key={s.key} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                  <span className="small text-dark fw-semibold">{s.desc}</span>
                  <kbd className="bg-dark text-warning px-2 py-1 rounded font-monospace shadow-sm" style={{ fontSize: '0.85rem' }}>
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer bg-light p-2">
            <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
