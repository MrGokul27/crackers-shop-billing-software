import React, { useState, useEffect } from 'react';

export default function SalesSummaryModal({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success) setStats(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 px-3">
            <h6 className="modal-title fw-bold">
              <i className="fa-solid fa-chart-line text-warning me-2"></i> Today's Sales Collection
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Calculating today's sales...</div>
              </div>
            ) : (
              <div>
                {/* Total Today Big Card */}
                <div className="card border-0 bg-primary text-white p-3 rounded-3 shadow-sm mb-3 text-center">
                  <span className="text-uppercase fw-semibold" style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    Today's Total Collection
                  </span>
                  <h1 className="fw-bolder my-1 font-monospace">
                    ₹{stats?.todaySales?.toLocaleString('en-IN') || 0}
                  </h1>
                  <div className="d-flex justify-content-center gap-3 small mt-1 text-light opacity-90">
                    <span><i className="fa-solid fa-file-invoice me-1"></i> {stats?.todayBillsCount || 0} Bills</span>
                    <span>•</span>
                    <span><i className="fa-solid fa-boxes-stacked me-1"></i> {stats?.totalItemsSold || 0} Items Sold</span>
                  </div>
                </div>

                {/* Breakdown by Payment Mode */}
                <h6 className="fw-bold text-secondary mb-2" style={{ fontSize: '0.85rem' }}>
                  PAYMENT MODE BREAKDOWN
                </h6>

                <div className="row g-2 mb-3">
                  {/* Cash */}
                  <div className="col-4">
                    <div className="p-2 border rounded-3 text-center bg-light">
                      <div className="text-success fw-bold small">
                        <i className="fa-solid fa-money-bill-wave me-1"></i> CASH
                      </div>
                      <div className="fw-bold fs-6 font-monospace mt-1 text-dark">
                        ₹{stats?.cashSales || 0}
                      </div>
                    </div>
                  </div>

                  {/* UPI */}
                  <div className="col-4">
                    <div className="p-2 border rounded-3 text-center bg-light">
                      <div className="text-purple fw-bold small" style={{ color: '#8b5cf6' }}>
                        <i className="fa-solid fa-qrcode me-1"></i> UPI
                      </div>
                      <div className="fw-bold fs-6 font-monospace mt-1 text-dark">
                        ₹{stats?.upiSales || 0}
                      </div>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="col-4">
                    <div className="p-2 border rounded-3 text-center bg-light">
                      <div className="text-primary fw-bold small">
                        <i className="fa-solid fa-credit-card me-1"></i> CARD
                      </div>
                      <div className="fw-bold fs-6 font-monospace mt-1 text-dark">
                        ₹{stats?.cardSales || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Time Lifetime Counter */}
                <div className="bg-light p-2 rounded border d-flex justify-content-between align-items-center small">
                  <span className="text-muted">Total Season Sales (All Bills):</span>
                  <span className="fw-bold text-dark font-monospace">
                    ₹{stats?.allTimeSales?.toLocaleString('en-IN') || 0} ({stats?.allTimeBillsCount || 0} bills)
                  </span>
                </div>
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
