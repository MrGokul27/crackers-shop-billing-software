import React, { useState, useEffect } from 'react';

export default function Navbar({
  settings,
  cashier,
  onSwitchCashier,
  onOpenSales,
  onOpenPastBills,
  onOpenInventory,
  onOpenBarcodes,
  onOpenSettings,
  onOpenShortcuts,
  onOpenConnectDevices,
  activeClientsCount,
  soundEnabled,
  onToggleSound
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="pos-header">
      <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-2">
        {/* Shop Name & Logo */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.8rem' }}>🎆</span>
            <div>
              <h1 className="h5 mb-0 fw-bold text-white tracking-wide">
                {settings?.shopName || 'CRACKER POS'}
              </h1>
              <small className="text-warning opacity-90 fw-semibold" style={{ fontSize: '0.78rem' }}>
                {settings?.tagline || 'Direct Factory Sivakasi Crackers'}
              </small>
            </div>
          </div>

          {/* Pulsing Live Barcode Scanner Badge */}
          <div className="d-none d-xl-flex align-items-center gap-2 bg-success bg-opacity-25 border border-success border-opacity-50 text-white px-3 py-1 rounded-pill small">
            <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }} role="status"></span>
            <span className="fw-semibold text-light" style={{ fontSize: '0.8rem' }}>
              <i className="fa-solid fa-barcode text-warning me-1"></i> Scanner Ready
            </span>
          </div>

          {/* Live Multi-Device Sync Indicator */}
          <button
            className="btn btn-outline-success btn-sm rounded-pill px-3 py-1 d-none d-lg-flex align-items-center gap-2 text-white border-success border-opacity-50"
            onClick={onOpenConnectDevices}
            title="Click to Connect More Devices / QR Code"
            style={{ backgroundColor: 'rgba(25, 135, 84, 0.2)' }}
          >
            <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }}></span>
            <span className="fw-semibold" style={{ fontSize: '0.8rem' }}>
              <i className="fa-solid fa-mobile-screen-button text-warning me-1"></i> Multi-Device Sync
            </span>
            <span className="badge bg-success rounded-pill px-2 py-0" style={{ fontSize: '0.7rem' }}>
              {activeClientsCount || 1}
            </span>
          </button>
        </div>

        {/* Center Clock */}
        <div className="d-none d-md-flex align-items-center gap-3 text-white">
          <div className="badge bg-dark bg-opacity-50 text-warning px-3 py-2 rounded-pill font-monospace" style={{ fontSize: '0.9rem' }}>
            <i className="fa-regular fa-clock me-2"></i>
            {time}
          </div>
        </div>

        {/* Right Actions: Cashier, Sales, Past Bills, Barcodes, Settings */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Mobile Connect Button */}
          <button
            className="btn btn-outline-success btn-sm fw-semibold rounded-pill px-2 py-1 d-lg-none text-white"
            onClick={onOpenConnectDevices}
            title="Connect Mobile / Tablets"
          >
            <i className="fa-solid fa-mobile-screen-button text-warning"></i>
          </button>

          {/* Sound Toggle */}
          <button
            className={`btn btn-sm ${soundEnabled ? 'btn-outline-warning' : 'btn-outline-secondary'} text-white rounded-pill px-2 py-1`}
            onClick={onToggleSound}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          >
            <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
          </button>

          {/* Barcode Catalog & Test */}
          <button
            className="btn btn-outline-warning btn-sm fw-semibold rounded-pill px-3 d-flex align-items-center gap-1 text-white border-warning"
            onClick={onOpenBarcodes}
            title="View & Test Cracker Barcodes"
          >
            <i className="fa-solid fa-barcode text-warning"></i>
            <span>Barcodes</span>
          </button>

          {/* Today's Sales Collection */}
          <button
            className="btn btn-warning btn-sm fw-bold rounded-pill px-3 shadow-sm d-flex align-items-center gap-1"
            onClick={onOpenSales}
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>Today's Total</span>
          </button>

          {/* Past Bills */}
          <button
            className="btn btn-outline-light btn-sm fw-semibold rounded-pill px-3 d-flex align-items-center gap-1"
            onClick={onOpenPastBills}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>Bills</span>
          </button>

          {/* Manage Products / Items */}
          <button
            className="btn btn-outline-light btn-sm fw-semibold rounded-pill px-3 d-flex align-items-center gap-1"
            onClick={onOpenInventory}
          >
            <i className="fa-solid fa-boxes-stacked"></i>
            <span>Items</span>
          </button>

          {/* Settings */}
          <button
            className="btn btn-outline-light btn-sm fw-semibold rounded-pill px-2 py-1"
            onClick={onOpenSettings}
            title="Shop & Thermal Printer Settings"
          >
            <i className="fa-solid fa-gear"></i>
          </button>

          {/* Keyboard Shortcuts Guide */}
          <button
            className="btn btn-outline-light btn-sm fw-semibold rounded-pill px-2 py-1"
            onClick={onOpenShortcuts}
            title="Shortcuts Guide (F2, F4, Enter)"
          >
            <i className="fa-solid fa-keyboard"></i>
          </button>

          {/* Cashier Badge & Switch */}
          <div
            className="cashier-badge cursor-pointer"
            onClick={onSwitchCashier}
            style={{ cursor: 'pointer' }}
            title="Click to Switch Cashier"
          >
            <i className="fa-solid fa-circle-user text-warning"></i>
            <span className="fw-bold">{cashier}</span>
            <i className="fa-solid fa-arrow-right-from-bracket text-light opacity-75 ms-1" style={{ fontSize: '0.75rem' }}></i>
          </div>
        </div>
      </div>
    </header>
  );
}
