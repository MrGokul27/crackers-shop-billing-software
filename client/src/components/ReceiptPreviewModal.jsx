import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function ReceiptPreviewModal({ bill, settings, onClose, onPrint }) {
  if (!bill) return null;

  const formattedDate = new Date(bill.createdAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const upiString = settings?.upiId && bill.grandTotal > 0
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.shopName || 'Cracker Shop')}&am=${bill.grandTotal}&cu=INR&tn=Bill%20${encodeURIComponent(bill.billNo)}`
    : null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 px-3">
            <h6 className="modal-title fw-bold">
              <i className="fa-solid fa-receipt text-warning me-2"></i> Bill #{bill.billNo}
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3 bg-light">
            {/* Realistic Thermal Receipt Preview Container */}
            <div className="bg-white p-3 rounded shadow-sm border font-monospace" style={{ fontSize: '0.88rem', color: '#111' }}>
              <div className="text-center mb-2">
                <h5 className="fw-bolder mb-0 text-uppercase">{settings?.shopName || 'SRI KRISHNA CRACKERS'}</h5>
                <small className="text-muted d-block">{settings?.tagline}</small>
                <small className="text-muted d-block">{settings?.address}</small>
                <small className="fw-bold d-block">Ph: {settings?.phone}</small>
              </div>

              <hr className="border-secondary my-2 border-dashed" />

              <div className="d-flex justify-content-between small">
                <span><strong>Bill:</strong> {bill.billNo}</span>
                <span>{formattedDate}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span><strong>Cashier:</strong> {bill.cashier || 'Owner/Admin'}</span>
                <span className="badge bg-secondary">{bill.paymentMethod}</span>
              </div>
              {bill.customerPhone && (
                <div className="small"><strong>Cust Phone:</strong> {bill.customerPhone}</div>
              )}

              <hr className="border-secondary my-2 border-dashed" />

              <table className="w-100 mb-2" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr className="border-bottom">
                    <th className="pb-1 text-start">ITEM</th>
                    <th className="pb-1 text-center">QTY</th>
                    <th className="pb-1 text-end">RATE</th>
                    <th className="pb-1 text-end">AMT</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items?.map((item, idx) => (
                    <tr key={idx} className="border-bottom border-light">
                      <td className="py-1 text-start">{item.name}</td>
                      <td className="py-1 text-center">{item.qty}</td>
                      <td className="py-1 text-end">₹{item.price}</td>
                      <td className="py-1 text-end font-monospace">₹{item.total || item.price * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-flex justify-content-between small">
                <span>Total Items:</span>
                <span className="fw-bold">{bill.totalItemsCount || bill.items?.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span>Subtotal:</span>
                <span>₹{bill.subtotal}</span>
              </div>
              {bill.discount > 0 && (
                <div className="d-flex justify-content-between small text-danger">
                  <span>Festival Discount:</span>
                  <span>-₹{bill.discount}</span>
                </div>
              )}

              <hr className="my-2 border-dark" />

              <div className="d-flex justify-content-between fw-bolder fs-5 text-dark">
                <span>NET TOTAL:</span>
                <span className="text-success">₹{bill.grandTotal}</span>
              </div>

              <hr className="my-2 border-dark" />

              {bill.paymentMethod === 'CASH' && bill.amountReceived > 0 && (
                <div className="small bg-light p-1 rounded">
                  <div className="d-flex justify-content-between">
                    <span>Cash Given:</span>
                    <span>₹{bill.amountReceived}</span>
                  </div>
                  {bill.changeToReturn > 0 && (
                    <div className="d-flex justify-content-between fw-bold text-success">
                      <span>Change Returned:</span>
                      <span>₹{bill.changeToReturn}</span>
                    </div>
                  )}
                </div>
              )}

              {upiString && (
                <div className="text-center my-2">
                  <QRCodeSVG value={upiString} size={80} level="M" className="mx-auto" />
                  <div style={{ fontSize: '0.68rem' }} className="text-muted mt-1">UPI QR on Receipt</div>
                </div>
              )}

              <div className="text-center text-muted small mt-2">
                <p className="mb-0 fw-bold" style={{ whiteSpace: 'pre-line' }}>{settings?.footerNote}</p>
                <small className="text-secondary">*** Computer Generated Invoice ***</small>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light p-2 d-flex justify-content-between">
            <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-success fw-bold px-4 shadow-sm" onClick={onPrint}>
              <i className="fa-solid fa-print me-2"></i> Print to Thermal Machine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
