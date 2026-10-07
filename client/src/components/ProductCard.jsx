import React from 'react';

export default function ProductCard({ product, inCartQty, onAddToCart, onUpdateQty }) {
  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const handleCardClick = (e) => {
    // If clicking +/- buttons, don't trigger card add
    if (e.target.closest('.card-qty-control')) return;
    onAddToCart(product);
  };

  return (
    <div
      className={`cracker-card ${inCartQty > 0 ? 'in-cart' : ''}`}
      onClick={handleCardClick}
    >
      {/* In Cart Indicator */}
      {inCartQty > 0 && (
        <span className="cart-qty-badge">
          <i className="fa-solid fa-check me-1"></i> {inCartQty} in Bill
        </span>
      )}

      {/* Top Details */}
      <div className="d-flex align-items-start gap-2 mb-2">
        <div className="cracker-emoji-box">
          {product.emoji || '🎆'}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="d-flex align-items-center gap-1">
            <span className="badge bg-light text-secondary border rounded-pill px-2" style={{ fontSize: '0.68rem' }}>
              {product.category}
            </span>
            {product.unit && (
              <span className="badge bg-secondary bg-opacity-10 text-muted rounded-pill px-1" style={{ fontSize: '0.65rem' }}>
                {product.unit}
              </span>
            )}
          </div>
          <h6 className="fw-bold mt-1 mb-0 text-truncate-2 text-dark" style={{ fontSize: '0.92rem', lineHeight: '1.25' }} title={product.name}>
            {product.name}
          </h6>
          {product.barcode && (
            <small className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
              #{product.barcode}
            </small>
          )}
        </div>
      </div>

      {/* Bottom Pricing & Controls */}
      <div className="d-flex align-items-end justify-content-between pt-2 border-top border-light">
        <div>
          <div className="d-flex align-items-baseline gap-1">
            <span className="price-current">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="price-mrp">₹{product.mrp}</span>
            )}
          </div>
          {discountPercent > 0 && (
            <span className="badge bg-danger bg-opacity-10 text-danger fw-bold" style={{ fontSize: '0.68rem' }}>
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick Action Button */}
        {inCartQty > 0 ? (
          <div className="card-qty-control d-flex align-items-center gap-1 bg-white border border-success rounded-pill px-1 py-1 shadow-sm">
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '24px', height: '24px' }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQty(product.id, inCartQty - 1);
              }}
            >
              <i className="fa-solid fa-minus text-danger" style={{ fontSize: '0.7rem' }}></i>
            </button>
            <span className="fw-bold font-monospace px-1 text-success" style={{ fontSize: '0.88rem' }}>
              {inCartQty}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '24px', height: '24px' }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQty(product.id, inCartQty + 1);
              }}
            >
              <i className="fa-solid fa-plus text-success" style={{ fontSize: '0.7rem' }}></i>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-outline-warning text-dark fw-bold rounded-pill px-3 py-1"
            style={{ fontSize: '0.8rem' }}
          >
            <i className="fa-solid fa-plus me-1 text-warning"></i> Add
          </button>
        )}
      </div>
    </div>
  );
}
