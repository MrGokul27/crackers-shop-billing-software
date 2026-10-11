import React, { useState } from 'react';
import BarcodeGenerator, { downloadBarcodeImage, downloadProductSticker } from './BarcodeGenerator';

const CATEGORIES = [
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
  'OTHERS'
];

const COMMON_BRANDS = [
  'Standard Fireworks',
  'Cock Brand',
  'Sony Fireworks',
  'Ayyan Fireworks',
  'Anil Fireworks',
  'Coronation Fireworks',
  'Sri Kaliswari'
];

const EMOJIS = ['✨', '🎇', '⭐', '🎆', '🪴', '🏺', '⛲', '🌸', '🌀', '🎡', '💫', '🚀', '🌌', '🧨', '🧧', '💥', '⚡', '💣', '🕯️', '🌠', '🍿', '🐍', '💨', '🦚', '🎁', '👑', '🏷️', '📦'];

export default function ProductManagerModal({ products, onRefreshProducts, onClose }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'SINGLE SHOT CRACKERS',
    brand: 'Standard Fireworks',
    stock: 50,
    price: '',
    mrp: '',
    barcode: '',
    emoji: '✨',
    unit: 'Box',
    inStock: true
  });

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'SINGLE SHOT CRACKERS',
      brand: 'Standard Fireworks',
      stock: 50,
      price: '',
      mrp: '',
      barcode: String(Math.floor(1000000 + Math.random() * 9000000)),
      emoji: '✨',
      unit: 'Box',
      inStock: true
    });
  };

  const handleStartEdit = (p) => {
    setEditingProduct(p);
    setIsCreating(false);
    setFormData({
      name: p.name,
      category: p.category,
      brand: p.brand || 'Standard Fireworks',
      stock: p.stock !== undefined ? p.stock : 50,
      price: p.price,
      mrp: p.mrp || p.price,
      barcode: p.barcode || '',
      emoji: p.emoji || '✨',
      unit: p.unit || 'Box',
      inStock: p.inStock !== undefined ? p.inStock : true
    });
  };

  const handleGenerateRandomBarcode = () => {
    setFormData(prev => ({
      ...prev,
      barcode: String(Math.floor(1000000 + Math.random() * 9000000))
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Please enter Cracker Name and Selling Price');
      return;
    }

    try {
      if (isCreating) {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          setIsCreating(false);
          onRefreshProducts();
        }
      } else if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          setEditingProduct(null);
          onRefreshProducts();
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this cracker item?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportBackup = () => {
    if (!products || products.length === 0) {
      alert('No products to export.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cracker-items-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) {
          alert('Invalid file format. Expected a JSON array of cracker items.');
          return;
        }
        if (!window.confirm(`Restore ${imported.length} cracker items from backup file?`)) return;

        const res = await fetch('/api/products/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: imported })
        });
        if (res.ok) {
          try {
            localStorage.setItem('CRACKER_PRODUCTS_CACHE_V1', JSON.stringify(imported));
          } catch (e) {}
          alert(`Successfully restored ${imported.length} cracker items!`);
          onRefreshProducts();
        } else {
          alert('Failed to sync items to server.');
        }
      } catch (err) {
        alert('Error reading JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filtered = products.filter(p => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      (p.brand && p.brand.toLowerCase().includes(q)) || 
      (p.barcode && p.barcode.includes(q))
    );
  }).sort((a, b) => {
    const idxA = CATEGORIES.findIndex(c => c.toLowerCase() === (a.category || '').toLowerCase());
    const idxB = CATEGORIES.findIndex(c => c.toLowerCase() === (b.category || '').toLowerCase());
    const orderA = idxA === -1 ? 999 : idxA;
    const orderB = idxB === -1 ? 999 : idxB;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 px-3">
            <h6 className="modal-title fw-bold">
              <i className="fa-solid fa-boxes-stacked text-warning me-2"></i> Manage Cracker Items & Barcodes
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3">
            {/* Add or Edit Form Drawer */}
            {(isCreating || editingProduct) && (
              <form onSubmit={handleSave} className="p-3 bg-light rounded-3 border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-primary mb-0">
                    {isCreating ? '➕ Add New Cracker Item' : `✏️ Edit: ${editingProduct?.name}`}
                  </h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary py-0"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>

                <div className="row g-2">
                  {/* Name */}
                  <div className="col-md-5">
                    <label className="form-label small fw-bold mb-1">Cracker Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. 10cm Electric Sparklers"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="col-md-3">
                    <label className="form-label small fw-bold mb-1">Category</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div className="col-md-4">
                    <label className="form-label small fw-bold mb-1">
                      <i className="fa-solid fa-tag text-primary me-1"></i> Brand
                    </label>
                    <input
                      type="text"
                      list="brandOptions"
                      className="form-control form-control-sm"
                      placeholder="e.g. Standard Fireworks / Cock Brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                    <datalist id="brandOptions">
                      {COMMON_BRANDS.map(b => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>

                  {/* Selling Price */}
                  <div className="col-md-3">
                    <label className="form-label small fw-bold mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control form-control-sm font-monospace fw-bold"
                      placeholder="120"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  {/* MRP */}
                  <div className="col-md-2">
                    <label className="form-label small fw-bold mb-1">MRP Price (₹)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control form-control-sm font-monospace"
                      placeholder="200"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="col-md-2">
                    <label className="form-label small fw-bold mb-1">
                      <i className="fa-solid fa-boxes-stacked text-success me-1"></i> Stock Qty
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm font-monospace fw-bold"
                      placeholder="50"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  {/* Unit */}
                  <div className="col-md-2">
                    <label className="form-label small fw-bold mb-1">Unit</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Box / Pkt / Pce"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>

                  {/* Emoji Icon */}
                  <div className="col-md-3">
                    <label className="form-label small fw-bold mb-1">Icon / Emoji</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    >
                      {EMOJIS.map(em => (
                        <option key={em} value={em}>{em} Icon</option>
                      ))}
                    </select>
                  </div>

                  {/* Barcode with Auto-Generate */}
                  <div className="col-12 col-md-6">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label small fw-bold mb-1">Barcode</label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary small text-decoration-none"
                        style={{ fontSize: '0.72rem' }}
                        onClick={handleGenerateRandomBarcode}
                      >
                        Auto-Gen
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace fw-bold"
                      placeholder="8901001"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    />
                  </div>
                </div>

                {/* Live Barcode Preview Box */}
                {formData.barcode && (
                  <div className="col-12 text-center bg-white p-2 rounded border mt-2">
                    <div className="small text-muted mb-1">Live Generated Scannable Barcode:</div>
                    <BarcodeGenerator
                      value={formData.barcode}
                      width={1.6}
                      height={42}
                      fontSize={12}
                      displayValue={true}
                    />
                  </div>
                )}

                <div className="mt-2 text-end">
                  <button type="submit" className="btn btn-success btn-sm px-4 fw-bold">
                    <i className="fa-solid fa-floppy-disk me-1"></i> Save Cracker Item
                  </button>
                </div>
              </form>
            )}

            {/* Top Toolbar */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="input-group input-group-sm" style={{ maxWidth: '240px' }}>
                  <span className="input-group-text bg-white">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filter cracker, brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Backup & Restore Action Buttons */}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm"
                  onClick={handleExportBackup}
                  title="Download a backup file of all cracker items (JSON)"
                >
                  <i className="fa-solid fa-download text-primary"></i>
                  <span>Backup JSON</span>
                </button>

                <label
                  className="btn btn-outline-secondary btn-sm mb-0 d-flex align-items-center gap-1 shadow-sm cursor-pointer"
                  title="Upload & Restore cracker items from a backup JSON file"
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-upload text-success"></i>
                  <span>Restore JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="d-none"
                    onChange={handleImportBackup}
                  />
                </label>
              </div>

              {!isCreating && !editingProduct && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm fw-bold px-3 rounded-pill shadow-sm"
                  onClick={handleStartCreate}
                >
                  <i className="fa-solid fa-plus me-1"></i> Add New Cracker
                </button>
              )}
            </div>

            {/* Render Sleep Auto-Restore Protection Notice */}
            <div className="alert alert-success bg-opacity-10 border border-success border-opacity-25 py-1 px-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2 small">
              <span style={{ fontSize: '0.78rem' }}>
                <i className="fa-solid fa-shield-halved text-success me-1"></i>
                <strong>Render Persistence Active:</strong> All items are auto-saved to your browser and will self-restore automatically if Render restarts after inactivity.
              </span>
              <span className="badge bg-success bg-opacity-25 text-dark font-monospace" style={{ fontSize: '0.74rem' }}>
                {products.length} Items Preserved
              </span>
            </div>

            {/* Items Table */}
            <div className="table-responsive" style={{ maxHeight: '380px' }}>
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Barcode</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        <i className="fa-solid fa-box-open fs-2 d-block mb-2 text-secondary opacity-50"></i>
                        No cracker items found. Click <strong>"Add New Cracker"</strong> above to create your first item!
                      </td>
                    </tr>
                  ) : (
                    filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <span className="me-2 fs-6">{p.emoji || '🎆'}</span>
                        <strong className="text-dark">{p.name}</strong>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border">
                          {p.category}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                          <i className="fa-solid fa-tag me-1" style={{ fontSize: '0.65rem' }}></i>
                          {p.brand || 'Standard'}
                        </span>
                      </td>
                      <td>
                        {(p.stock !== undefined && p.stock <= 0) ? (
                          <span className="badge bg-danger">0 Out of Stock</span>
                        ) : (p.stock !== undefined && p.stock < 10) ? (
                          <span className="badge bg-warning text-dark font-monospace fw-bold">
                            <i className="fa-solid fa-triangle-exclamation me-1"></i> {p.stock} Low
                          </span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 font-monospace fw-bold">
                            <i className="fa-solid fa-boxes-stacked me-1" style={{ fontSize: '0.65rem' }}></i>
                            {p.stock !== undefined ? p.stock : 50} in stock
                          </span>
                        )}
                      </td>
                      <td className="fw-bold text-success font-monospace fs-6">
                        ₹{p.price}
                      </td>
                      <td className="font-monospace text-primary fw-bold small">
                        #{p.barcode || '-'}
                      </td>
                      <td className="text-end">
                        {p.barcode && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary py-0 px-2 me-1"
                              title="Download Box Sticker with Price"
                              onClick={() => downloadProductSticker({
                                barcode: p.barcode,
                                name: p.name,
                                price: p.price,
                                mrp: p.mrp
                              })}
                            >
                              <i className="fa-solid fa-tag"></i> Sticker
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success py-0 px-2 me-1"
                              title="Download Barcode PNG Image"
                              onClick={() => downloadBarcodeImage(p.barcode, p.name)}
                            >
                              <i className="fa-solid fa-barcode"></i> PNG
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary py-0 px-2 me-1"
                          onClick={() => handleStartEdit(p)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger py-0 px-2"
                          onClick={() => handleDelete(p.id)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer bg-light p-2">
            <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
