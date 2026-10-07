# 🎆 Cracker Shop Billing Software (POS)
### Ultra-Fast, Simple & Attractive Billing Software for Thermal Printers

Built with **React + Node.js Express**, **Bootstrap 5**, and **FontAwesome**.

Designed specifically for **non-technical cashiers and shop owners** during busy festival / Diwali seasons.

---

## 🚀 Live Production & Quick Start

### 1. Run Live in 1 Command:
```bash
npm start
```
Open your browser at: **`http://localhost:5000`**

### 2. Windows 1-Click Counter Launcher:
Double-click **`start-pos.bat`** on your desktop to automatically start the live server and launch the billing screen.

### 3. Deploy Online (Live Cloud):
Follow the step-by-step instructions in [DEPLOYMENT_GUIDE.md](file:///d:/My%20Projects/Cracker%20Shop%20Billing%20Software/DEPLOYMENT_GUIDE.md) to deploy to **Render**, **Railway**, **Docker**, or your own **VPS**.

---

## ✨ Key Features Designed for Non-Technical Cashiers

- 🚫 **Zero Technical Jargon**: No database setup, no SKU, no complex GST or accounting terms.
- ⚡ **Global Barcode Scanner Engine**: Point any USB / Bluetooth barcode gun at any cracker box to immediately add it to the bill with POS beep audio confirmation.
- 🏷️ **Real Code128 Barcode Studio**: View, download high-res PNG barcodes, or print master sticker sheets for all cracker products.
- 🖨️ **Thermal Billing Machine Ready**: Optimized for **80mm & 58mm POS thermal receipt rolls** and standard A4/A5 printers with instant 1-click printing.
- 📱 **Instant Dynamic UPI QR Code**: Generates on-screen and on-bill QR code with the exact bill amount for instant customer scanning (GPay, PhonePe, Paytm).
- 💵 **Smart Cash & Change Calculator**: Fast cash tender buttons (₹500, ₹1000, ₹2000, ₹5000) and displays exact change to return to customer.
- 🌟 **Pre-Loaded Cracker Catalog**: Comes with realistic cracker items across 9 categories (Sparklers, Flower Pots, Ground Chakra, Rockets, Sound Crackers, Garlands/Wala, Sky Shots, Kids Special, Gift Boxes).
- 📊 **Today's Collection Tracker**: Track daily total revenue with Cash, UPI, and Card breakdowns.
- 📜 **Past Bills & Reprints**: Search and reprint any previous bill in 1 second.
- 📦 **Simple Cracker & Price Manager**: Easily add new items, change prices, or toggle out-of-stock items in 2 clicks.
- 📱 **100% Multi-Device & Multi-Counter Responsive**: Works seamlessly on Desktop PC, Touch POS Terminals, Laptops, iPads, and Mobile devices on the same Wi-Fi.

---

## ⌨️ Fast Keyboard Shortcuts for Counter Speed

| Shortcut | Action |
| :--- | :--- |
| **`F2`** | Focus Search / Barcode Bar |
| **`Enter`** | Print Bill / Complete Sale |
| **`F4`** | Select **CASH** Mode |
| **`F7`** | Select **UPI / QR** Mode |
| **`F8`** | Select **CARD** Mode |
| **`Esc`** | Clear Search / Close Dialogs |

---

## 🖨️ Thermal Printer Setup (80mm & 58mm)

1. Connect your Thermal USB / Bluetooth / Ethernet billing machine (Epson, TVS, NGX, Posiflex, Retsol, Rugtek, etc.).
2. In Chrome or Edge print dialog:
   - **Destination**: Select your Thermal Printer.
   - **Paper Size**: `80mm` (or `58mm`).
   - **Margins**: Select `None` or `Minimum`.
   - **Headers & Footers**: Uncheck.
3. Once configured, pressing **PRINT BILL** (or **Enter**) triggers rapid, crisp thermal printing!

---

## 🛠️ Project Structure

```
cracker-shop-billing-software/
├── client/                     # React Frontend (Vite)
│   ├── dist/                   # Production Compiled Static Assets
│   ├── src/
│   │   ├── components/         # POS UI Components
│   │   ├── utils/              # Audio & Barcode Hooks
│   │   └── styles.css          # POS Theme & Print Media CSS
│   └── package.json
├── server/                     # Node.js Express Backend
│   ├── data/                   # Persistent JSON Database
│   │   ├── products.json
│   │   ├── bills.json
│   │   └── settings.json
│   ├── db.js                   # JSON Data Layer & Seed Catalog
│   ├── index.js                # Unified REST API & Static Frontend Server
│   └── package.json
├── Dockerfile                  # Multi-stage Production Docker image
├── docker-compose.yml          # Containerized live deployment
├── render.yaml                 # 1-Click Render.com Cloud deploy config
├── start-pos.bat               # 1-Click Windows desktop launcher
├── DEPLOYMENT_GUIDE.md         # Step-by-step Live Deployment manual
└── package.json                # Root Runner & Build Script
```
