import React, { useState } from 'react';

const POPULAR_CASHIERS = ['Owner/Admin'];

export default function CashierSwitchModal({ currentCashier, onSelectCashier, onClose }) {
  const [customName, setCustomName] = useState('');

  const handleSelect = (name) => {
    onSelectCashier(name);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customName.trim()) {
      onSelectCashier(customName.trim());
      onClose();
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '380px' }}>
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 px-3">
            <h6 className="modal-title fw-bold">
              <i className="fa-solid fa-circle-user text-warning me-2"></i> Switch Cashier
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3">
            <p className="small text-muted mb-2">Select active cashier or counter profile:</p>

            <div className="d-flex flex-column gap-1 mb-3">
              {POPULAR_CASHIERS.map(c => {
                const isActive = currentCashier === c;
                return (
                  <button
                    key={c}
                    type="button"
                    className={`btn text-start d-flex justify-content-between align-items-center py-2 px-3 rounded-3 ${
                      isActive ? 'btn-primary fw-bold' : 'btn-light border'
                    }`}
                    onClick={() => handleSelect(c)}
                  >
                    <span><i className="fa-regular fa-user me-2"></i> {c}</span>
                    {isActive && <i className="fa-solid fa-check"></i>}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleCustomSubmit} className="pt-2 border-top">
              <label className="form-label small fw-bold mb-1">Or Enter Cashier Name:</label>
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Suresh Counter 4"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <button type="submit" className="btn btn-success fw-bold">
                  Set
                </button>
              </div>
            </form>
          </div>

          <div className="modal-footer bg-light p-2">
            <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
