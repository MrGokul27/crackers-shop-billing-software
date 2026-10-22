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
          <div className="d-flex align-items-center gap-1 flex-wrap">
            {product.code && (
              <span className="badge bg-dark text-warning font-monospace fw-bold rounded-pill px-2" style={{ fontSize: '0.68rem' }} title={`Code: ${product.code}`}>
                Code: {product.code}
              </span>
            )}
            <span className="badge bg-light text-secondary border rounded-pill px-2" style={{ fontSize: '0.68rem' }}>
              {product.category}
            </span>
            {product.brand && (
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2" style={{ fontSize: '0.68rem' }} title={`Brand: ${product.brand}`}>
                <i className="fa-solid fa-tag me-1" style={{ fontSize: '0.6rem' }}></i>{product.brand}
              </span>
            )}
            {product.stock !== undefined && (
              <span className={`badge rounded-pill px-2 ${
                product.stock <= 0 
                  ? 'bg-danger text-white' 
                  : product.stock < 10 
                    ? 'bg-warning text-dark' 
                    : 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
              }`} style={{ fontSize: '0.68rem' }} title={`Stock: ${product.stock}`}>
                <i className="fa-solid fa-boxes-stacked me-1" style={{ fontSize: '0.6rem' }}></i>
                {product.stock <= 0 ? 'Out of stock' : `${product.stock} in stock`}
              </span>
            )}
            {product.unit && (
              <span className={`badge rounded-pill px-2 ${
                product.priceQty && product.priceQty > 1
                  ? 'bg-warning bg-opacity-25 text-dark border border-warning fw-bold'
                  : 'bg-secondary bg-opacity-10 text-muted'
              }`} style={{ fontSize: '0.65rem' }}>
                {product.priceQty && product.priceQty > 1
                  ? `${product.priceQty} ${product.unit}s Pack`
                  : `1 ${product.unit}`}
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
          {/* How many boxes for this amount */}
          <div className="mt-1">
            <span className={`badge rounded-pill px-2 py-0 fw-bold ${
              product.priceQty && product.priceQty > 1
                ? 'bg-primary text-white shadow-sm'
                : 'bg-light text-secondary border'
            }`} style={{ fontSize: '0.68rem' }}>
              {product.priceQty && product.priceQty > 1
                ? `${product.priceQty} ${product.unit || 'Box'}s this amount`
                : `1 ${product.unit || 'Box'} this amount`}
            </span>
          </div>
          {discountPercent > 0 && (
            <span className="badge bg-danger bg-opacity-10 text-danger fw-bold mt-1 d-inline-block" style={{ fontSize: '0.65rem' }}>
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
