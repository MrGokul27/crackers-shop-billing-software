import React, { useState } from 'react';
import BarcodeGenerator, { downloadBarcodeImage, downloadProductSticker } from './BarcodeGenerator';

const CATEGORIES = [
  'Sparklers',
  'Flower Pots',
  'Chakra',
  'Rockets',
  'Sound Crackers',
  'Garlands',
  'Sky Shots',
  'Kids Special',
  'Gift Box'
];

const EMOJIS = ['✨', '🎇', '🎆', '🪴', '🏺', '⛲', '🌸', '🌀', '🎡', '💫', '🚀', '🌌', '🧨', '🧧', '💥', '⚡', '💣', '🌠', '🍿', '🐍', '💨', '🦚', '🎁', '👑'];

export default function ProductManagerModal({ products, onRefreshProducts, onClose }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Sparklers',
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
      category: 'Sparklers',
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

  const filtered = products.filter(p => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q));
  });

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
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
                  <div className="col-md-6">
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
                  <div className="col-md-3">
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

                  {/* Unit */}
                  <div className="col-md-3">
                    <label className="form-label small fw-bold mb-1">Unit</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Box / Pkt / Pce"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>

                  {/* Barcode with Auto-Generate */}
                  <div className="col-md-3">
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
                </div>

                <div className="mt-2 text-end">
                  <button type="submit" className="btn btn-success btn-sm px-4 fw-bold">
                    <i className="fa-solid fa-floppy-disk me-1"></i> Save Cracker Item
                  </button>
                </div>
              </form>
            )}

            {/* Top Toolbar */}
            <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
              <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                <span className="input-group-text bg-white">
                  <i className="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter cracker items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {!isCreating && !editingProduct && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm fw-bold px-3 rounded-pill"
                  onClick={handleStartCreate}
                >
                  <i className="fa-solid fa-plus me-1"></i> Add New Cracker
                </button>
              )}
            </div>

            {/* Items Table */}
            <div className="table-responsive" style={{ maxHeight: '380px' }}>
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Barcode</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
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
                  ))}
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
