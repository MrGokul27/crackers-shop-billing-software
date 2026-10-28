import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BarcodeGenerator, { downloadProductSticker, downloadBarcodeImage } from './BarcodeGenerator';

const CATEGORY_ORDER = [
  'SINGLE SHOT CRACKERS',
  'SPARKLERS',
  'CHAKKARS',
  'TWINKLING STARS',
  'CANDLES & LIGHTS',
  'FLOWER POTS',
  'ATOM BOMBS',
  'LOOSE CRACKERS',
  'FANCY VARIETIES',
  'TIN',
  'PEACOCK BIG',
  'SHOTS',
  '3 EFFECT SERIES',
  'COLOUR SMOKE',
  'GIFT BOXES',
  'ROCKETS',
  'OTHERS'
];

export default function BarcodeCatalogModal({ products, settings, onSimulateScan, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Guarantee strictly unique products: no duplicate barcodes, no duplicate IDs
  const uniqueProducts = React.useMemo(() => {
    const seenBarcodes = new Set();
    const seenIds = new Set();
    const list = [];
    for (const p of products || []) {
      if (!p) continue;
      const barcodeKey = p.barcode ? String(p.barcode).trim() : null;
      const idKey = p.id ? String(p.id) : null;

      // Avoid duplicates
      if (barcodeKey && seenBarcodes.has(barcodeKey)) continue;
      if (idKey && seenIds.has(idKey)) continue;

      if (barcodeKey) seenBarcodes.add(barcodeKey);
      if (idKey) seenIds.add(idKey);
      list.push(p);
    }
    return list;
  }, [products]);

  const uniqueCats = [...new Set(uniqueProducts.map(p => p.category).filter(Boolean))];
  uniqueCats.sort((a, b) => {
    const idxA = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === (a || '').toLowerCase());
    const idxB = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === (b || '').toLowerCase());
    const orderA = idxA === -1 ? 999 : idxA;
    const orderB = idxB === -1 ? 999 : idxB;
    if (orderA !== orderB) return orderA - orderB;
    return (a || '').localeCompare(b || '');
  });
  const categories = ['All', ...uniqueCats];

  const filtered = React.useMemo(() => {
    return uniqueProducts.filter(p => {
      const matchesCat = selectedCategory === 'All' || (p.category || '').toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCat) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.code && String(p.code).toLowerCase().includes(q)) ||
        (p.barcode && String(p.barcode).includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }).sort((a, b) => {
      const idxA = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === (a.category || '').toLowerCase());
      const idxB = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === (b.category || '').toLowerCase());
      const orderA = idxA === -1 ? 999 : idxA;
      const orderB = idxB === -1 ? 999 : idxB;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [uniqueProducts, selectedCategory, searchTerm]);

  // Group products category-wise for clean separate-page printing
  const categoryGroups = React.useMemo(() => {
    const groups = {};
    for (const item of filtered) {
      const cat = item.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    }

    // Sort categories according to CATEGORY_ORDER
    const sortedCatNames = Object.keys(groups).sort((a, b) => {
      const idxA = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === a.toLowerCase());
      const idxB = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === b.toLowerCase());
      const orderA = idxA === -1 ? 999 : idxA;
      const orderB = idxB === -1 ? 999 : idxB;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });

    return sortedCatNames.map(catName => ({
      categoryName: catName,
      items: groups[catName]
    }));
  }, [filtered]);

  // Clean print state setup
  const applyPrintStyles = () => {
    document.body.classList.remove('printing-receipt');
    document.body.classList.add('printing-barcodes');

    let printStyle = document.getElementById('barcode-print-page-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'barcode-print-page-style';
      document.head.appendChild(printStyle);
    }
    printStyle.innerHTML = `
      @page {
        size: A4 portrait;
        margin: 8mm 6mm;
      }
    `;
  };

  const removePrintStyles = () => {
    document.body.classList.remove('printing-barcodes');
    const s = document.getElementById('barcode-print-page-style');
    if (s) s.remove();
  };

  useEffect(() => {
    const handleBeforePrint = () => applyPrintStyles();
    const handleAfterPrint = () => removePrintStyles();

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      removePrintStyles();
    };
  }, []);

  const handlePrintBarcodes = () => {
    applyPrintStyles();

    setTimeout(() => {
      window.print();
      setTimeout(removePrintStyles, 1000);
    }, 250);
  };

  return (
    <>
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
                  <span>Print Stickers Sheet ({filtered.length} Items • Category Pages • 4/Row)</span>
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
                        {p.code && (
                          <span className="badge bg-dark text-warning font-monospace fw-bold small" style={{ fontSize: '0.65rem' }}>
                            Code: {p.code}
                          </span>
                        )}
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
                      <div className="text-end">
                        <span className="fw-bold text-success font-monospace" style={{ fontSize: '0.95rem' }}>
                          ₹{p.price}
                        </span>
                        <div className="text-muted small" style={{ fontSize: '0.68rem', lineHeight: '1.1' }}>
                          {(p.priceQty && p.priceQty > 1) 
                            ? `${p.priceQty} ${p.unit || 'Box'}s this amount` 
                            : `1 ${p.unit || 'Box'} this amount`}
                        </div>
                      </div>
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
                          priceQty: p.priceQty || 1,
                          unit: p.unit || 'Box',
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
              Showing <strong>{filtered.length}</strong> unique cracker items ({categoryGroups.length} categories)
            </span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm fw-bold px-3"
                onClick={handlePrintBarcodes}
              >
                <i className="fa-solid fa-print me-1"></i> Print Stickers Sheet ({filtered.length} Items • Category Pages • 4/Row)
              </button>
              <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Render print sheet directly to document.body for clean pagination outside React root flow */}
      {createPortal(
        <div className="printable-barcode-sheet">
          {categoryGroups.map((group, gIdx) => (
            <div 
              className="barcode-print-category-page" 
              key={`cat-page-${group.categoryName}-${gIdx}`}
            >
              <div className="barcode-print-header">
                <div className="barcode-print-cat-badge">
                  {group.categoryName}
                </div>
                <p className="barcode-print-sub">
                  Category: <strong>{group.categoryName}</strong> • {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'} (4 Stickers per Item Row)
                </p>
                <hr className="barcode-print-hr" />
              </div>

              <div className="barcode-print-sheet-content">
                {group.items.map((p, pIdx) => (
                  <div className="barcode-print-row" key={`prow-${p.id || p.barcode}-${pIdx}`}>
                    {[1, 2, 3, 4].map(copyNum => (
                      <div className="barcode-print-sticker" key={`stk-${p.id || p.barcode}-copy-${copyNum}`}>
                        <div className="sticker-product-name" title={p.name}>
                          {p.name}
                        </div>
                        <div className="sticker-barcode-wrapper">
                          <BarcodeGenerator
                            value={p.barcode || '8901001'}
                            width={1.2}
                            height={22}
                            fontSize={10}
                            margin={2}
                            displayValue={true}
                          />
                        </div>
                        <div className="sticker-price-line">
                          <span className="fw-bold">PRICE: ₹{p.price}</span>
                          {p.mrp && Number(p.mrp) > Number(p.price) && (
                            <span className="mrp-val">(MRP ₹{p.mrp})</span>
                          )}
                        </div>
                        <div className="sticker-qty-note">
                          {(p.priceQty && p.priceQty > 1) 
                            ? `${p.priceQty} ${p.unit || 'Box'}s this amount` 
                            : `1 ${p.unit || 'Box'} this amount`}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
