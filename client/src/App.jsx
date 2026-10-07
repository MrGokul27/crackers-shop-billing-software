import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sound } from './utils/audio';
import { useBarcodeScanner } from './utils/useBarcodeScanner';

import Navbar from './components/Navbar';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import CartSection from './components/CartSection';
import ThermalReceipt from './components/ThermalReceipt';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import UpiPaymentModal from './components/UpiPaymentModal';
import SalesSummaryModal from './components/SalesSummaryModal';
import PastBillsModal from './components/PastBillsModal';
import ProductManagerModal from './components/ProductManagerModal';
import SettingsModal from './components/SettingsModal';
import CashierSwitchModal from './components/CashierSwitchModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import BarcodeCatalogModal from './components/BarcodeCatalogModal';
import ConnectDevicesModal from './components/ConnectDevicesModal';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart & Billing State
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mobile View Switcher ('products' | 'cart')
  const [mobileTab, setMobileTab] = useState('products');

  // Live Barcode Scan Notification Banner
  const [scanNotification, setScanNotification] = useState(null);

  // Settings & Cashier
  const [settings, setSettings] = useState(null);
  const [cashier, setCashier] = useState('Kumar (Cashier 1)');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals & Print State
  const [activeBillForPrint, setActiveBillForPrint] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showPastBillsModal, setShowPastBillsModal] = useState(false);
  const [showProductManagerModal, setShowProductManagerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCashierModal, setShowCashierModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showConnectDevicesModal, setShowConnectDevicesModal] = useState(false);
  const [activeClientsCount, setActiveClientsCount] = useState(1);

  const searchInputRef = useRef(null);

  // Fetch initial products & settings
  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(json => {
        if (json.success) setProducts(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  };

  const fetchSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setSettings(json.data);
          if (json.data.cashierName) setCashier(json.data.cashierName);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();

    // Connect to Server-Sent Events (SSE) for Real-Time Multi-Device Sync
    let eventSource;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          if (type === 'connected') {
            if (data?.totalConnected) setActiveClientsCount(data.totalConnected);
          } else if (type === 'clients_count') {
            if (data?.count) setActiveClientsCount(data.count);
          } else if (type === 'products_updated') {
            // Instantly sync products across all connected screens
            if (data?.products) {
              setProducts(data.products);
            } else {
              fetchProducts();
            }
          } else if (type === 'settings_updated') {
            // Instantly sync shop settings across all connected screens
            if (data?.settings) {
              setSettings(data.settings);
            } else {
              fetchSettings();
            }
          }
        } catch (e) {
          // Keep-alive or ping frame
        }
      };

      eventSource.onerror = () => {
        // EventSource will automatically attempt to reconnect
      };
    } catch (err) {
      console.warn('SSE not initialized:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Category items count lookup
  const categoryCounts = products.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  // Cart totals for quick badge display
  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartGrandTotal = Math.max(0, Math.round(cartSubtotal - (parseFloat(discount) || 0)));

  // Cart operations
  const handleAddToCart = useCallback((product) => {
    sound.beep();
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        emoji: product.emoji,
        unit: product.unit,
        category: product.category,
        qty: 1
      }];
    });
  }, []);

  // Dedicated Barcode Gun Scan Handler
  const handleBarcodeScanned = useCallback((scannedCode) => {
    if (!scannedCode) return;
    const raw = String(scannedCode).replace(/[\r\n\x00-\x1F\x7F]/g, '').trim();
    if (!raw) return;
    const code = raw.toLowerCase();

    const product = products.find(p => {
      if (!p) return false;
      const pCode = String(p.barcode || '').trim().toLowerCase();
      const pId = String(p.id || '').trim().toLowerCase();
      const pName = String(p.name || '').trim().toLowerCase();

      if (pCode && pCode === code) return true;
      if (pId && pId === code) return true;

      const cleanScanned = code.replace(/^0+/, '');
      const cleanPCode = pCode.replace(/^0+/, '');
      if (cleanScanned && cleanPCode && cleanScanned === cleanPCode) return true;

      if (pName === code) return true;
      return false;
    });

    if (product) {
      handleAddToCart(product);
      setScanNotification({
        type: 'success',
        message: `✨ Scanned: ${product.emoji || '🎆'} ${product.name} (₹${product.price}) added to Bill!`,
        product
      });
      setSearchQuery('');
    } else {
      sound.errorBeep();
      setScanNotification({
        type: 'error',
        message: `⚠️ Barcode #${raw} not recognized in cracker list.`,
        product: null
      });
    }

    setTimeout(() => {
      setScanNotification(null);
    }, 3500);
  }, [products, handleAddToCart]);

  // Connect Global USB/Bluetooth Barcode Scanner Hook
  useBarcodeScanner({
    onScan: handleBarcodeScanned,
    minLength: 3,
    maxInterval: 90
  });

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    sound.beep();
    setCart(prev =>
      prev.map(item => item.id === productId ? { ...item, qty: newQty } : item)
    );
  };

  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerPhone('');
  };

  // Barcode / Search handler for manual Enter key in search box
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      handleBarcodeScanned(searchQuery.trim());
    }
  };

  // Keyboard Shortcuts (F2, F4, F7, F8, etc.)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' && e.target !== searchInputRef.current && e.target.type !== 'button') {
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setPaymentMethod('CASH');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setPaymentMethod('UPI');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setPaymentMethod('CARD');
      } else if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Checkout and Direct Thermal Print
  const handleCheckoutAndPrint = async (billPayload) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...billPayload,
          cashier
        })
      });

      const json = await response.json();
      if (json.success) {
        const savedBill = json.data;
        setActiveBillForPrint(savedBill);

        // Sound effect & festive celebration
        sound.cashRegister();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Clear cart for next customer
        handleClearCart();

        // If on mobile, return to products tab
        setMobileTab('products');

        // Trigger Instant Browser / Thermal Printer Dialog
        document.body.classList.remove('printing-barcodes');
        document.body.classList.add('printing-receipt');
        setTimeout(() => {
          window.print();
          setTimeout(() => {
            document.body.classList.remove('printing-receipt');
          }, 500);
          setIsProcessing(false);
          searchInputRef.current?.focus();
        }, 300);
      } else {
        alert(json.message || 'Error saving bill');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error during checkout');
      setIsProcessing(false);
    }
  };

  // Reprint a past bill
  const handleSelectBillToReprint = (bill) => {
    setActiveBillForPrint(bill);
    setShowPastBillsModal(false);
    setShowPreviewModal(true);
  };

  const handleTriggerPrintFromPreview = () => {
    setShowPreviewModal(false);
    document.body.classList.remove('printing-barcodes');
    document.body.classList.add('printing-receipt');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-receipt');
      }, 500);
    }, 200);
  };

  // Filtered Products for Display
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    if (!matchesCategory) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* 1. Header Bar */}
      <Navbar
        settings={settings}
        cashier={cashier}
        onSwitchCashier={() => setShowCashierModal(true)}
        onOpenSales={() => setShowSalesModal(true)}
        onOpenPastBills={() => setShowPastBillsModal(true)}
        onOpenInventory={() => setShowProductManagerModal(true)}
        onOpenBarcodes={() => setShowBarcodeModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onOpenConnectDevices={() => setShowConnectDevicesModal(true)}
        activeClientsCount={activeClientsCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(sound.toggle())}
      />

      {/* Barcode Scan Live Confirmation Toast Banner */}
      {scanNotification && (
        <div
          className={`position-fixed top-0 start-50 translate-middle-x mt-3 z-3 shadow-lg px-4 py-2 rounded-pill d-flex align-items-center gap-2 text-white fw-bold ${
            scanNotification.type === 'success' ? 'bg-success' : 'bg-danger'
          }`}
          style={{ animation: 'fadeInDown 0.3s ease-out' }}
        >
          <i className={`fa-solid ${scanNotification.type === 'success' ? 'fa-barcode' : 'fa-triangle-exclamation'}`}></i>
          <span>{scanNotification.message}</span>
        </div>
      )}

      {/* Mobile Tab Switcher (Visible only on screens < 992px) */}
      <div className="d-lg-none bg-white border-bottom p-2 d-flex gap-2">
        <button
          type="button"
          className={`btn btn-sm flex-fill fw-bold rounded-pill py-2 ${mobileTab === 'products' ? 'btn-primary' : 'btn-light border text-dark'}`}
          onClick={() => setMobileTab('products')}
        >
          <i className="fa-solid fa-boxes-stacked me-1"></i>
          <span>Crackers ({products.length})</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm flex-fill fw-bold rounded-pill py-2 d-flex align-items-center justify-content-center gap-1 ${mobileTab === 'cart' ? 'btn-success text-white' : 'btn-light border text-dark'}`}
          onClick={() => setMobileTab('cart')}
        >
          <i className="fa-solid fa-receipt me-1"></i>
          <span>Bill ({totalCartItems})</span>
          {cartGrandTotal > 0 && (
            <span className="badge bg-warning text-dark font-monospace ms-1">
              ₹{cartGrandTotal}
            </span>
          )}
        </button>
      </div>

      {/* Main Responsive Grid */}
      <div className="container-fluid flex-grow-1 p-0">
        <div className="row g-0">
          {/* Left Column: Products & Search */}
          <div className={`col-12 col-lg-7 col-xl-8 d-flex flex-column ${mobileTab === 'cart' ? 'd-none d-lg-flex' : ''}`}>
            {/* Top Search & Barcode Scan Bar */}
            <div className="p-2 bg-white border-bottom shadow-sm">
              <div className="pos-search-wrapper">
                <i className="fa-solid fa-barcode pos-search-icon text-warning"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control pos-search-input"
                  placeholder="⚡ Point Barcode Scanner gun & scan box, or type cracker name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="pos-search-clear"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Badges */}
            <CategoryFilter
              activeCategory={activeCategory}
              onSelectCategory={(cat) => setActiveCategory(cat)}
              counts={categoryCounts}
            />

            {/* Cracker Products Grid */}
            <div className="product-grid-container">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status"></div>
                  <div className="mt-2 text-muted fw-bold">Loading Cracker Catalog...</div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 m-3 border">
                  <div style={{ fontSize: '3rem' }}>🔍</div>
                  <h5 className="fw-bold text-secondary mt-2">No Crackers Found</h5>
                  <p className="text-muted small">Try searching another name or change category.</p>
                  <button
                    className="btn btn-warning btn-sm rounded-pill fw-bold px-3"
                    onClick={() => {
                      setActiveCategory('All');
                      setSearchQuery('');
                    }}
                  >
                    Show All Crackers
                  </button>
                </div>
              ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-2">
                  {filteredProducts.map(product => {
                    const inCartItem = cart.find(i => i.id === product.id);
                    return (
                      <div className="col" key={product.id}>
                        <ProductCard
                          product={product}
                          inCartQty={inCartItem ? inCartItem.qty : 0}
                          onAddToCart={handleAddToCart}
                          onUpdateQty={handleUpdateQty}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Cashier Billing Cart (Always visible on desktop/laptop, full screen on mobile when 'cart' tab active) */}
          <div className={`col-12 col-lg-5 col-xl-4 ${mobileTab === 'products' ? 'd-none d-lg-block' : ''}`}>
            <CartSection
              cart={cart}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckoutAndPrint={handleCheckoutAndPrint}
              onOpenUpiQr={(amount) => setShowUpiModal(true)}
              discount={discount}
              setDiscount={setDiscount}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              settings={settings}
              isProcessing={isProcessing}
              onBackToProducts={() => setMobileTab('products')}
            />
          </div>
        </div>
      </div>

      {/* Mobile Floating Bottom Bar (Visible on mobile when in 'products' tab with items in cart) */}
      {mobileTab === 'products' && totalCartItems > 0 && (
        <div className="mobile-floating-cart-bar d-lg-none">
          <div>
            <div className="fw-bold" style={{ fontSize: '0.92rem' }}>
              <i className="fa-solid fa-cart-shopping text-warning me-1"></i> {totalCartItems} {totalCartItems === 1 ? 'Item' : 'Items'}
            </div>
            <div className="font-monospace fw-bolder text-warning fs-5">
              ₹{cartGrandTotal}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-success fw-bold px-3 py-2 rounded-pill shadow"
            onClick={() => setMobileTab('cart')}
          >
            <span>View Bill & Pay</span>
            <i className="fa-solid fa-arrow-right ms-2"></i>
          </button>
        </div>
      )}

      {/* Hidden Component Rendered ONLY for Thermal Bill Machine Print (@media print) */}
      <ThermalReceipt
        bill={activeBillForPrint}
        settings={settings}
      />

      {/* Modals */}
      {showPreviewModal && (
        <ReceiptPreviewModal
          bill={activeBillForPrint}
          settings={settings}
          onClose={() => setShowPreviewModal(false)}
          onPrint={handleTriggerPrintFromPreview}
        />
      )}

      {showUpiModal && (
        <UpiPaymentModal
          amount={Math.max(0, Math.round(cart.reduce((s, i) => s + (i.price * i.qty), 0) - (parseFloat(discount) || 0)))}
          settings={settings}
          onClose={() => setShowUpiModal(false)}
          onConfirmPayment={() => {
            setShowUpiModal(false);
            const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
            const disc = parseFloat(discount) || 0;
            const grandTotal = Math.max(0, Math.round(subtotal - disc));
            handleCheckoutAndPrint({
              items: cart,
              subtotal,
              discount: disc,
              grandTotal,
              paymentMethod: 'UPI',
              amountReceived: grandTotal,
              changeToReturn: 0,
              customerPhone: customerPhone.trim()
            });
          }}
        />
      )}

      {showBarcodeModal && (
        <BarcodeCatalogModal
          products={products}
          settings={settings}
          onSimulateScan={handleBarcodeScanned}
          onClose={() => setShowBarcodeModal(false)}
        />
      )}

      {showSalesModal && (
        <SalesSummaryModal
          onClose={() => setShowSalesModal(false)}
        />
      )}

      {showPastBillsModal && (
        <PastBillsModal
          onClose={() => setShowPastBillsModal(false)}
          onSelectBillToReprint={handleSelectBillToReprint}
        />
      )}

      {showProductManagerModal && (
        <ProductManagerModal
          products={products}
          onRefreshProducts={fetchProducts}
          onClose={() => setShowProductManagerModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSaveSettings={async (newSettings) => {
            try {
              const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
              });
              const json = await res.json();
              if (json.success) {
                setSettings(json.data);
                if (json.data.cashierName) setCashier(json.data.cashierName);
              }
            } catch (err) {
              console.error(err);
            }
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showCashierModal && (
        <CashierSwitchModal
          currentCashier={cashier}
          onSelectCashier={(name) => setCashier(name)}
          onClose={() => setShowCashierModal(false)}
        />
      )}

      {showShortcutsModal && (
        <KeyboardShortcutsModal
          onClose={() => setShowShortcutsModal(false)}
        />
      )}

      {showConnectDevicesModal && (
        <ConnectDevicesModal
          activeClientsCount={activeClientsCount}
          onClose={() => setShowConnectDevicesModal(false)}
        />
      )}
    </div>
  );
}
