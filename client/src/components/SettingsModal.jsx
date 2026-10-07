import React, { useState } from 'react';

export default function SettingsModal({ settings, onSaveSettings, onClose }) {
  const [formData, setFormData] = useState({
    shopName: settings?.shopName || 'SRI KRISHNA CRACKERS',
    tagline: settings?.tagline || 'Direct Factory Sivakasi Crackers',
    address: settings?.address || 'Gandhi Road, Main Bazaar',
    phone: settings?.phone || '+91 98765 43210',
    upiId: settings?.upiId || 'crackerstore@upi',
    printerType: settings?.printerType || 'thermal80',
    footerNote: settings?.footerNote || '✨ HAPPY DIWALI & SAFE CELEBRATIONS! ✨\nItems once sold cannot be exchanged or returned.',
    cashierName: settings?.cashierName || 'Cashier 1'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 px-3">
            <h6 className="modal-title fw-bold">
              <i className="fa-solid fa-gear text-warning me-2"></i> Shop & Thermal Printer Settings
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-3">
              <div className="row g-2">
                {/* Shop Name */}
                <div className="col-12">
                  <label className="form-label small fw-bold mb-1">Shop / Store Name (Printed on Bill)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm fw-bold"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    required
                  />
                </div>

                {/* Tagline */}
                <div className="col-12">
                  <label className="form-label small fw-bold mb-1">Shop Tagline / Slogan</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div className="col-md-7">
                  <label className="form-label small fw-bold mb-1">Store Address</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div className="col-md-5">
                  <label className="form-label small fw-bold mb-1">Phone / Mobile No</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* UPI ID for Dynamic QR */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold mb-1">
                    <i className="fa-solid fa-qrcode text-purple me-1"></i> UPI ID (for GPay/PhonePe QR)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    placeholder="e.g. yourname@oksbi"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  />
                </div>

                {/* Thermal Printer Paper Size */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold mb-1">
                    <i className="fa-solid fa-print text-primary me-1"></i> Billing Machine / Paper Size
                  </label>
                  <select
                    className="form-select form-select-sm fw-bold"
                    value={formData.printerType}
                    onChange={(e) => setFormData({ ...formData, printerType: e.target.value })}
                  >
                    <option value="thermal80">80mm Thermal Paper (Standard POS)</option>
                    <option value="thermal58">58mm Thermal Paper (Compact Mini POS)</option>
                    <option value="a4">A4 / A5 Normal Laser/Inkjet Printer</option>
                  </select>
                </div>

                {/* Footer Note */}
                <div className="col-12">
                  <label className="form-label small fw-bold mb-1">Bill Bottom Message / Greeting</label>
                  <textarea
                    rows="2"
                    className="form-control form-control-sm"
                    value={formData.footerNote}
                    onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light p-2 d-flex justify-content-between">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm fw-bold px-4">
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
