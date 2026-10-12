import React, { useState } from 'react';

export default function CartSection({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckoutAndPrint,
  onOpenUpiQr,
  discount,
  setDiscount,
  paymentMethod,
  setPaymentMethod,
  customerPhone,
  setCustomerPhone,
  settings,
  isProcessing,
  onBackToProducts // For mobile view navigation
}) {
  // Cash Tendered is strictly blank by default until the cashier clicks or types an amount
  const [cashTendered, setCashTendered] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(discount > 0);
  
  // Calculate Subtotal
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Calculate Net Total
  const discountAmount = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, Math.round(subtotal - discountAmount));

  // Change to return (only calculated if cash is explicitly entered)
  const tenderedNum = cashTendered !== '' ? (parseFloat(cashTendered) || 0) : 0;
  const changeToReturn = tenderedNum > grandTotal ? Math.round(tenderedNum - grandTotal) : 0;

  const handleApplyQuickDiscount = (amount) => {
    if (amount === 'reset') {
      setDiscount(0);
      setShowDiscountInput(false);
    } else if (typeof amount === 'string' && amount.endsWith('%')) {
      const pct = parseFloat(amount);
      const calculated = Math.round((subtotal * pct) / 100);
      setDiscount(calculated);
      setShowDiscountInput(true);
    } else {
      setDiscount(amount);
      setShowDiscountInput(true);
    }
  };

  const handleSetQuickCash = (amount) => {
    setCashTendered(String(amount));
  };

  const handleClearAll = () => {
    setCashTendered('');
    onClearCart();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0 || isProcessing) return;

    const hasCash = paymentMethod === 'CASH' && cashTendered.trim() !== '' && !isNaN(parseFloat(cashTendered));
    const cashVal = hasCash ? parseFloat(cashTendered) : 0;

    onCheckoutAndPrint({
      items: cart,
      subtotal,
      discount: discountAmount,
      grandTotal,
      paymentMethod,
      amountReceived: hasCash ? cashVal : 0,
      changeToReturn: hasCash ? changeToReturn : 0,
      customerPhone: customerPhone.trim()
    });

    setCashTendered('');
  };

  return (
    <div className="cart-panel">
      {/* Cart Header */}
      <div className="cart-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          {onBackToProducts && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-lg-none py-1 px-2 me-1"
              onClick={onBackToProducts}
              title="Back to Cracker Catalog"
            >
              <i className="fa-solid fa-arrow-left me-1"></i> Catalog
            </button>
          )}
          <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: '0.85rem' }}>
            <i className="fa-solid fa-receipt me-1"></i> BILL
          </span>
          <span className="fw-bold text-dark" style={{ fontSize: '1rem' }}>
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-pill px-2 py-1"
            onClick={handleClearAll}
            title="Clear all items from bill"
            style={{ fontSize: '0.78rem' }}
          >
            <i className="fa-solid fa-trash-can me-1"></i> Clear Bill
          </button>
        )}
      </div>

      {/* Cart Items List (Spacious, Clear & Scrollable) */}
      <div className="cart-items-list">
        {cart.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div className="text-muted mb-2" style={{ fontSize: '3.5rem' }}>
              🛒
            </div>
            <h5 className="fw-bold text-secondary">Bill is Empty</h5>
            <p className="text-muted small mb-3">
              Scan product barcodes with your scanner gun or tap any cracker in the catalog.
            </p>
            {onBackToProducts && (
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill px-3 d-lg-none"
                onClick={onBackToProducts}
              >
                <i className="fa-solid fa-boxes-stacked me-1"></i> Browse Cracker Catalog
              </button>
            )}
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="cart-item-row d-flex align-items-center justify-content-between gap-2 shadow-sm">
              <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                <span style={{ fontSize: '1.4rem' }}>{item.emoji || '🎆'}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.92rem' }} title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-muted small font-monospace">
                    ₹{item.price}{' '}
                    <span className="text-primary fw-semibold">
                      ({(item.priceQty && item.priceQty > 1) ? `${item.priceQty} ${item.unit || 'Box'}s` : `1 ${item.unit || 'Box'}`})
                    </span>
                    {' '}× {item.qty} = <span className="fw-bold text-success fs-6">₹{item.price * item.qty}</span>
                  </div>
                  {item.priceQty && item.priceQty > 1 && (
                    <div className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 py-0 px-2 mt-1" style={{ fontSize: '0.7rem' }}>
                      <i className="fa-solid fa-boxes-stacked me-1"></i>
                      Total: {item.qty * item.priceQty} {item.unit || 'Box'}s ({item.priceQty} {item.unit || 'Box'}s this amount)
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="d-flex align-items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  className="qty-btn text-danger"
                  onClick={() => onUpdateQty(item.id, item.qty - 1)}
                  title="Decrease"
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                <span className="qty-display">{item.qty}</span>
                <button
                  type="button"
                  className="qty-btn text-success"
                  onClick={() => onUpdateQty(item.id, item.qty + 1)}
                  title="Increase"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-link text-danger p-1 ms-1"
                  onClick={() => onRemoveItem(item.id)}
                  title="Remove Item"
                >
                  <i className="fa-regular fa-trash-can fs-6"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Calculations & Checkout Footer */}
      <div className="p-2 p-md-3 bg-light border-top flex-shrink-0">
        {/* Subtotal & Quick Discount */}
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center text-secondary mb-1">
            <span style={{ fontSize: '0.88rem' }}>Subtotal ({totalItems} items):</span>
            <span className="font-monospace fw-bold text-dark fs-6">₹{subtotal}</span>
          </div>

          {/* Discount Bar */}
          <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
            <div className="d-flex gap-1 flex-wrap">
              <span className="text-muted small me-1 align-self-center">Discount:</span>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 rounded-pill ${discount === 0 ? 'btn-secondary' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.72rem' }}
                onClick={() => handleApplyQuickDiscount('reset')}
              >
                None
              </button>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 rounded-pill ${discount === 50 ? 'btn-danger' : 'btn-outline-danger'}`}
                style={{ fontSize: '0.72rem' }}
                onClick={() => handleApplyQuickDiscount(50)}
              >
                -₹50
              </button>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 rounded-pill ${discount === 100 ? 'btn-danger' : 'btn-outline-danger'}`}
                style={{ fontSize: '0.72rem' }}
                onClick={() => handleApplyQuickDiscount(100)}
              >
                -₹100
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm py-0 px-2 rounded-pill"
                style={{ fontSize: '0.72rem' }}
                onClick={() => handleApplyQuickDiscount('5%')}
              >
                5%
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm py-0 px-2 rounded-pill"
                style={{ fontSize: '0.72rem' }}
                onClick={() => handleApplyQuickDiscount('10%')}
              >
                10%
              </button>
            </div>

            {/* Custom Discount Input */}
            <div className="input-group input-group-sm" style={{ width: '90px' }}>
              <span className="input-group-text bg-white px-1">₹</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                className="form-control text-end font-monospace fw-bold px-1"
                value={discount === 0 ? '' : discount}
                placeholder="0"
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>
        </div>

        {/* Grand Total Box (High Contrast) */}
        <div className="cart-total-box mb-2 d-flex align-items-center justify-content-between p-2">
          <div>
            <div className="text-warning text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.8px' }}>
              Total Payable
            </div>
            {discount > 0 && (
              <small className="text-danger-emphasis bg-danger bg-opacity-25 px-1 rounded" style={{ fontSize: '0.72rem' }}>
                Saved ₹{discount}
              </small>
            )}
          </div>
          <div className="text-end">
            <div className="font-monospace fw-bolder text-warning" style={{ fontSize: '1.8rem', lineHeight: '1.1' }}>
              ₹{grandTotal}
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="row g-1 mb-2">
          <div className="col-4">
            <button
              type="button"
              className={`payment-btn cash w-100 ${paymentMethod === 'CASH' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('CASH')}
            >
              <i className="fa-solid fa-money-bill-wave"></i>
              <span>CASH</span>
            </button>
          </div>
          <div className="col-4">
            <button
              type="button"
              className={`payment-btn upi w-100 ${paymentMethod === 'UPI' ? 'active' : ''}`}
              onClick={() => {
                setPaymentMethod('UPI');
                onOpenUpiQr(grandTotal);
              }}
            >
              <i className="fa-solid fa-qrcode"></i>
              <span>UPI / QR</span>
            </button>
          </div>
          <div className="col-4">
            <button
              type="button"
              className={`payment-btn card w-100 ${paymentMethod === 'CARD' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('CARD')}
            >
              <i className="fa-solid fa-credit-card"></i>
              <span>CARD</span>
            </button>
          </div>
        </div>

        {/* Quick Cash Tender (Shown when CASH is chosen) */}
        {paymentMethod === 'CASH' && grandTotal > 0 && (
          <div className="bg-white p-2 rounded-3 border mb-2">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="fw-semibold text-secondary small">
                Cash Given:
              </span>
              <div className="input-group input-group-sm" style={{ width: '120px' }}>
                <span className="input-group-text bg-light">₹</span>
                <input
                  type="number"
                  className="form-control text-end font-monospace fw-bold"
                  placeholder="Optional"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Tender Suggestions */}
            <div className="d-flex gap-1 flex-wrap">
              <span className="tender-badge" onClick={() => handleSetQuickCash(grandTotal)}>
                Exact
              </span>
              {grandTotal < 500 && (
                <span className="tender-badge" onClick={() => handleSetQuickCash(500)}>
                  ₹500
                </span>
              )}
              {grandTotal < 1000 && (
                <span className="tender-badge" onClick={() => handleSetQuickCash(1000)}>
                  ₹1000
                </span>
              )}
              {grandTotal < 2000 && (
                <span className="tender-badge" onClick={() => handleSetQuickCash(2000)}>
                  ₹2000
                </span>
              )}
              {grandTotal < 5000 && (
                <span className="tender-badge" onClick={() => handleSetQuickCash(5000)}>
                  ₹5000
                </span>
              )}
              {cashTendered !== '' && (
                <span className="tender-badge text-danger" onClick={() => setCashTendered('')}>
                  Clear
                </span>
              )}
            </div>

            {/* Change to Return Banner */}
            {cashTendered !== '' && tenderedNum > grandTotal && (
              <div className="alert alert-success py-1 px-2 mb-0 d-flex justify-content-between align-items-center mt-1">
                <span className="fw-bold text-success small">
                  <i className="fa-solid fa-hand-holding-dollar me-1"></i> Return Change:
                </span>
                <span className="font-monospace fw-bold fs-6 text-success">
                  ₹{changeToReturn}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Big Glow PRINT BILL Button */}
        <button
          type="button"
          className="btn btn-print-bill w-100"
          disabled={cart.length === 0 || isProcessing}
          onClick={handleSubmit}
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Printing...
            </>
          ) : (
            <>
              <i className="fa-solid fa-print"></i>
              <span>PRINT BILL (₹{grandTotal})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
