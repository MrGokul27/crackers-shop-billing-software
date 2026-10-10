import React, { useState } from 'react';
import BarcodeGenerator, { downloadProductSticker, downloadBarcodeImage } from './BarcodeGenerator';

export default function BarcodeCatalogModal({ products, settings, onSimulateScan, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    if (!matchesCat) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) || 
      (p.barcode && p.barcode.includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  });

  const handlePrintBarcodes = () => {
    document.body.classList.remove('printing-receipt');
    document.body.classList.add('printing-barcodes');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-barcodes');
      }, 500);
    }, 150);
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">
          {/* Header */}
          <div className="modal-header bg-dark text-white py-2 px-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5">🏷️</span>
              <div>
                <h6 className="modal-title fw-bold mb-0">Cracker Barcode & Product Sticker Studio</h6>
                <small className="text-warning" style={{ fontSize: '0.75rem' }}>
                  Standard Code128 Barcodes with Quiet Zones • Download & Stick on Cracker Boxes
                </small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3 bg-light">
            {/* Top Guide Banner */}
            <div className="alert alert-success py-2 px-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 small">
                <i className="fa-solid fa-circle-check fs-4 text-success"></i>
                <div>
                  <strong>How to Stick & Scan on Cracker Boxes:</strong><br />
                  Click <strong>"📦 Download Sticker"</strong> below ➔ Print or save the PNG sticker ➔ Paste it on your cracker box. When you scan it with your USB/Bluetooth barcode gun, it will instantly add to the bill!
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-dark btn-sm fw-bold px-3 shadow-sm d-flex align-items-center gap-2"
                  onClick={handlePrintBarcodes}
                >
                  <i className="fa-solid fa-print text-warning"></i>
                  <span>Print All Stickers Sheet</span>
                </button>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 bg-white p-2 rounded-3 border">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="small fw-bold text-muted">Category:</span>
                <div className="d-flex gap-1 flex-wrap">
                  {categories.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`btn btn-sm py-1 px-2 rounded-pill ${selectedCategory === c ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setSelectedCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
                <span className="input-group-text bg-light">
                  <i className="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter cracker or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>✕</button>
                )}
              </div>
            </div>

            {/* Barcode Cards Grid */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-2">
              {filtered.map(p => (
                <div className="col" key={p.id}>
                  <div className="barcode-sticker-card h-100">
                    {/* Item Title */}
                    <div className="d-flex align-items-center justify-content-between border-bottom pb-1 mb-1">
                      <div className="d-flex align-items-center gap-1 flex-wrap">
                        <span className="badge bg-light text-dark border small" style={{ fontSize: '0.68rem' }}>
                          {p.category}
                        </span>
                        {p.brand && (
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 small" style={{ fontSize: '0.65rem' }}>
                            <i className="fa-solid fa-tag me-1" style={{ fontSize: '0.6rem' }}></i>
                            {p.brand}
                          </span>
                        )}
                        {p.stock !== undefined && (
                          <span className={`badge small ${
                            p.stock <= 0 
                              ? 'bg-danger text-white' 
                              : p.stock < 10 
                                ? 'bg-warning text-dark' 
                                : 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {p.stock <= 0 ? '0 Stock' : `${p.stock} in stock`}
                          </span>
                        )}
                      </div>
                      <span className="fw-bold text-success font-monospace" style={{ fontSize: '0.95rem' }}>
                        ₹{p.price}
                      </span>
                    </div>

                    <div className="fw-bold text-dark text-truncate small mb-1" title={p.name}>
                      <span className="me-1">{p.emoji || '🎆'}</span>
                      {p.name}
                    </div>

                    {/* High-Contrast Scannable Barcode SVG */}
                    <div className="bg-white p-2 my-1 rounded border d-flex justify-content-center align-items-center">
                      <BarcodeGenerator
                        value={p.barcode || '8901001'}
                        width={1.8}
                        height={50}
                        fontSize={13}
                        displayValue={true}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex flex-column gap-1 mt-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary w-100 py-1 fw-bold shadow-sm"
                        style={{ fontSize: '0.78rem' }}
                        title="Download Product Sticker for Cracker Box"
                        onClick={() => downloadProductSticker({
                          barcode: p.barcode || '8901001',
                          name: p.name,
                          price: p.price,
                          mrp: p.mrp,
                          shopName: settings?.shopName || 'SRI KRISHNA CRACKERS',
                          category: p.category
                        })}
                      >
                        <i className="fa-solid fa-tag me-1"></i> Download Box Sticker
                      </button>

                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark flex-grow-1 py-1"
                          style={{ fontSize: '0.72rem' }}
                          title="Download Pure Barcode Image"
                          onClick={() => downloadBarcodeImage(p.barcode || '8901001', p.name)}
                        >
                          <i className="fa-solid fa-barcode me-1"></i> Pure Barcode
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success py-1 px-2 fw-semibold"
                          style={{ fontSize: '0.72rem' }}
                          title="Test Scan to Bill"
                          onClick={() => {
                            onSimulateScan(p.barcode);
                            onClose();
                          }}
                        >
                          <i className="fa-solid fa-cart-plus me-1"></i> Test
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer bg-light p-2 d-flex justify-content-between">
            <span className="text-muted small">
              Showing <strong>{filtered.length}</strong> cracker items
            </span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm fw-bold px-3"
                onClick={handlePrintBarcodes}
              >
                <i className="fa-solid fa-print me-1"></i> Print All Stickers / Sheet
              </button>
              <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden container formatted specifically for printing A4 / Sticker sheets */}
      <div className="printable-barcode-sheet">
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, textTransform: 'uppercase' }}>{settings?.shopName || 'SRI KRISHNA CRACKERS'}</h2>
          <p style={{ margin: '3px 0', fontSize: '13px' }}>Master Product Barcode Stickers</p>
          <hr style={{ borderTop: '2px solid #000' }} />
        </div>

        <div className="barcode-print-grid">
          {filtered.map(p => (
            <div className="barcode-print-sticker" key={p.id}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>
                {settings?.shopName || 'CRACKER STORE'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '3px' }}>
                {p.name}
              </div>
              <BarcodeGenerator
                value={p.barcode || '8901001'}
                width={2.2}
                height={60}
                fontSize={15}
                displayValue={true}
              />
              <div style={{ fontSize: '14px', fontWeight: '900', marginTop: '4px' }}>
                PRICE: ₹{p.price} {p.mrp > p.price && <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#555' }}>(MRP ₹{p.mrp})</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
