import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ---------------- REAL-TIME MULTI-DEVICE SSE SYNC ----------------
let sseClients = [];

export function broadcastEvent(type, data) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (err) {
      // client disconnected
    }
  });
}

// SSE stream for real-time live synchronization across devices
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (res.flushHeaders) res.flushHeaders();

  const clientId = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const client = { id: clientId, res };
  sseClients.push(client);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId, totalConnected: sseClients.length })}\n\n`);

  // Broadcast updated client count to all
  broadcastEvent('clients_count', { count: sseClients.length });

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
    broadcastEvent('clients_count', { count: sseClients.length });
  });
});

// Periodic keep-alive heartbeat ping every 25 seconds
setInterval(() => {
  sseClients.forEach(client => {
    try {
      client.res.write(`: ping\n\n`);
    } catch (err) {}
  });
}, 25000);

// ---------------- NETWORK & MULTI-DEVICE INFO ENDPOINT ----------------
app.get('/api/network-info', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    const networkUrls = [];
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          networkUrls.push({
            name,
            ip: iface.address,
            url: `http://${iface.address}:${PORT}`
          });
        }
      }
    }
    res.json({
      success: true,
      port: PORT,
      hostname: os.hostname(),
      networkUrls,
      activeClients: sseClients.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- PRODUCTS ENDPOINTS ----------------
// GET all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.getProducts();
    const { category, search } = req.query;
    let filtered = products;

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET product by barcode / quick lookup
app.get('/api/products/barcode/:barcode', (req, res) => {
  try {
    const products = db.getProducts();
    const barcode = req.params.barcode.trim();
    const product = products.find(p => p.barcode === barcode);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found for barcode' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add new product
app.post('/api/products', (req, res) => {
  try {
    const { name, category, price, mrp, barcode, emoji, unit, inStock, brand, stock } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const products = db.getProducts();
    const stockQty = stock !== undefined && stock !== '' ? parseInt(stock, 10) : 50;
    const newProduct = {
      id: 'p_' + Date.now(),
      name: name.trim(),
      category: category || 'General',
      brand: brand ? brand.trim() : 'Standard Fireworks',
      stock: isNaN(stockQty) ? 50 : stockQty,
      price: parseFloat(price) || 0,
      mrp: parseFloat(mrp) || parseFloat(price) || 0,
      barcode: barcode ? barcode.trim() : String(Math.floor(1000000 + Math.random() * 9000000)),
      emoji: emoji || '🎆',
      unit: unit || 'Box',
      inStock: inStock !== undefined ? inStock : (stockQty > 0)
    };

    products.unshift(newProduct);
    db.saveProducts(products);

    // Real-time broadcast to all connected devices
    broadcastEvent('products_updated', {
      action: 'create',
      product: newProduct,
      products
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const stockQty = req.body.stock !== undefined && req.body.stock !== '' 
      ? parseInt(req.body.stock, 10) 
      : products[index].stock;

    const updated = {
      ...products[index],
      ...req.body,
      brand: req.body.brand !== undefined ? req.body.brand.trim() : (products[index].brand || ''),
      stock: stockQty !== undefined && !isNaN(stockQty) ? stockQty : (products[index].stock ?? 50),
      inStock: req.body.inStock !== undefined 
        ? req.body.inStock 
        : (stockQty !== undefined ? stockQty > 0 : products[index].inStock),
      price: req.body.price !== undefined ? parseFloat(req.body.price) : products[index].price,
      mrp: req.body.mrp !== undefined ? parseFloat(req.body.mrp) : products[index].mrp
    };

    products[index] = updated;
    db.saveProducts(products);

    // Real-time broadcast to all connected devices
    broadcastEvent('products_updated', {
      action: 'update',
      product: updated,
      products
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    let products = db.getProducts();
    const exists = products.some(p => p.id === id);

    if (!exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    products = products.filter(p => p.id !== id);
    db.saveProducts(products);

    // Real-time broadcast to all connected devices
    broadcastEvent('products_updated', {
      action: 'delete',
      id,
      products
    });

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- BILLS & CHECKOUT ENDPOINTS ----------------
// GET all bills with filter
app.get('/api/bills', (req, res) => {
  try {
    const bills = db.getBills();
    const sorted = [...bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: sorted.length, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create new bill
app.post('/api/bills', (req, res) => {
  try {
    const { items, subtotal, discount, grandTotal, paymentMethod, amountReceived, changeToReturn, customerPhone, cashier } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    const bills = db.getBills();
    const settings = db.getSettings();

    const nextBillSeq = bills.length + 1001;
    const billNo = `CRK-${nextBillSeq}`;

    const newBill = {
      id: 'bill_' + Date.now(),
      billNo,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        qty: parseInt(item.qty, 10),
        total: parseFloat(item.price) * parseInt(item.qty, 10),
        emoji: item.emoji || '🎆',
        unit: item.unit || 'Box'
      })),
      totalItemsCount: items.reduce((acc, curr) => acc + (parseInt(curr.qty, 10) || 1), 0),
      subtotal: parseFloat(subtotal) || 0,
      discount: parseFloat(discount) || 0,
      grandTotal: parseFloat(grandTotal) || 0,
      paymentMethod: paymentMethod || 'CASH',
      amountReceived: (amountReceived !== undefined && amountReceived !== null && amountReceived !== '' && !isNaN(parseFloat(amountReceived))) ? parseFloat(amountReceived) : 0,
      changeToReturn: parseFloat(changeToReturn) || 0,
      customerPhone: customerPhone || '',
      cashier: cashier || settings.cashierName || 'Owner/Admin',
      createdAt: new Date().toISOString(),
      shopSnapshot: {
        shopName: settings.shopName,
        phone: settings.phone,
        address: settings.address,
        footerNote: settings.footerNote,
        upiId: settings.upiId
      }
    };

    bills.unshift(newBill);
    db.saveBills(bills);

    // Deduct stock for items in this bill
    const currentProducts = db.getProducts();
    let productsUpdated = false;
    items.forEach(item => {
      const prod = currentProducts.find(p => p.id === item.id);
      if (prod) {
        const itemQty = parseInt(item.qty, 10) || 1;
        const currentStock = prod.stock !== undefined ? parseInt(prod.stock, 10) : 50;
        const newStock = Math.max(0, currentStock - itemQty);
        prod.stock = newStock;
        if (newStock === 0) {
          prod.inStock = false;
        }
        productsUpdated = true;
      }
    });

    if (productsUpdated) {
      db.saveProducts(currentProducts);
      broadcastEvent('products_updated', {
        action: 'stock_deducted',
        products: currentProducts
      });
    }

    // Real-time broadcast to all connected devices
    broadcastEvent('bill_created', {
      bill: newBill,
      totalBills: bills.length
    });

    res.status(201).json({ success: true, data: newBill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single bill
app.get('/api/bills/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bills = db.getBills();
    const bill = bills.find(b => b.id === id || b.billNo === id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- STATS & SUMMARY ----------------
app.get('/api/stats', (req, res) => {
  try {
    const bills = db.getBills();
    const today = new Date().toISOString().split('T')[0];

    const todayBills = bills.filter(b => b.createdAt.startsWith(today));

    let todaySales = 0;
    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let totalItemsSold = 0;

    todayBills.forEach(b => {
      todaySales += b.grandTotal;
      totalItemsSold += b.totalItemsCount || 0;
      if (b.paymentMethod === 'CASH') cashSales += b.grandTotal;
      else if (b.paymentMethod === 'UPI') upiSales += b.grandTotal;
      else if (b.paymentMethod === 'CARD') cardSales += b.grandTotal;
    });

    res.json({
      success: true,
      data: {
        todayBillsCount: todayBills.length,
        todaySales,
        cashSales,
        upiSales,
        cardSales,
        totalItemsSold,
        allTimeBillsCount: bills.length,
        allTimeSales: bills.reduce((acc, b) => acc + (b.grandTotal || 0), 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- SETTINGS ENDPOINTS ----------------
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const current = db.getSettings();
    const updated = { ...current, ...req.body };
    db.saveSettings(updated);

    // Real-time broadcast to all connected devices
    broadcastEvent('settings_updated', {
      settings: updated
    });

    res.json({ success: true, data: updated, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- SERVE STATIC FRONTEND IN PRODUCTION ----------------
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  // If API route was not found, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  // Otherwise serve React index.html for SPA routing
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n======================================================');
  console.log(`🎆 Cracker Shop Billing Software Server Running!`);
  console.log(`💻 Local Machine:    http://localhost:${PORT}`);

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`📱 Other Devices/Wi-Fi: http://${iface.address}:${PORT}`);
      }
    }
  }
  console.log('======================================================\n');
});
