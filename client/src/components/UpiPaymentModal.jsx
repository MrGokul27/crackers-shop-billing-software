import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function UpiPaymentModal({ amount, settings, onClose, onConfirmPayment }) {
  if (!amount || amount <= 0) return null;

  const upiId = settings?.upiId || 'crackerstore@upi';
  const shopName = settings?.shopName || 'Cracker Shop';
  
  // Standard NPCI UPI URI Scheme
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR&tn=Crackers%20Bill`;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '380px' }}>
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-primary text-white py-2 px-3">
            <h6 className="modal-title fw-bold">
              <i className="fa-solid fa-qrcode me-2"></i> Scan UPI to Pay
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body text-center p-4">
            <div className="text-secondary small mb-1">Total Payable Amount</div>
            <h2 className="fw-bolder text-success font-monospace mb-3">
              ₹{amount}
            </h2>

            {/* High Contrast QR Box */}
            <div className="bg-white p-3 d-inline-block rounded-3 border border-2 border-primary shadow-sm mb-3">
              <QRCodeSVG value={upiString} size={190} level="H" includeMargin={true} />
            </div>

            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="badge bg-light text-dark border">
                <i className="fa-brands fa-google-pay text-primary me-1"></i> GPay
              </span>
              <span className="badge bg-light text-dark border">
                <i className="fa-solid fa-mobile-screen-button text-purple me-1"></i> PhonePe
              </span>
              <span className="badge bg-light text-dark border">
                <i className="fa-solid fa-wallet text-info me-1"></i> Paytm
              </span>
              <span className="badge bg-light text-dark border">
                <i className="fa-solid fa-building-columns text-success me-1"></i> BHIM
              </span>
            </div>

            <p className="text-muted small mb-0 font-monospace">
              UPI ID: <strong>{upiId}</strong>
            </p>
          </div>

          <div className="modal-footer bg-light p-2 d-flex justify-content-between">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success fw-bold px-3 shadow-sm"
              onClick={onConfirmPayment}
            >
              <i className="fa-solid fa-check-circle me-1"></i> Payment Received (Print)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
