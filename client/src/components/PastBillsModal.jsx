import React, { useState, useEffect } from 'react';

export default function PastBillsModal({ onClose, onSelectBillToReprint }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetch('/api/bills')
      .then(res => res.json())
      .then(json => {
        if (json.success) setBills(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredBills = bills.filter(b => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.billNo.toLowerCase().includes(q) ||
      (b.customerPhone && b.customerPhone.includes(q)) ||
      (b.cashier && b.cashier.toLowerCase().includes(q))
    );
  });

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 px-3">
            <h6 className="modal-title fw-bold">
              <i className="fa-solid fa-clock-rotate-left text-warning me-2"></i> Past Bills & Receipts
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3">
            {/* Search Bar */}
            <div className="input-group mb-3">
              <span className="input-group-text bg-white">
                <i className="fa-solid fa-magnifying-glass text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by Bill No (e.g. CRK-1001) or Mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Loading bills...</div>
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="fa-regular fa-folder-open fs-2 mb-2"></i>
                <p>No bills found.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '420px' }}>
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Bill No</th>
                      <th>Date & Time</th>
                      <th>Items</th>
                      <th>Payment</th>
                      <th>Grand Total</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map(b => (
                      <tr key={b.id}>
                        <td className="fw-bold font-monospace text-primary">
                          {b.billNo}
                        </td>
                        <td className="small text-muted">
                          {new Date(b.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {b.totalItemsCount || b.items?.reduce((s, i) => s + i.qty, 0)} items
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            b.paymentMethod === 'CASH' ? 'bg-success' :
                            b.paymentMethod === 'UPI' ? 'bg-primary' : 'bg-info text-dark'
                          }`}>
                            {b.paymentMethod}
                          </span>
                        </td>
                        <td className="fw-bold font-monospace fs-6 text-dark">
                          ₹{b.grandTotal}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success me-1"
                            title="Reprint Bill"
                            onClick={() => onSelectBillToReprint(b)}
                          >
                            <i className="fa-solid fa-print me-1"></i> Reprint
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer bg-light p-2">
            <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
