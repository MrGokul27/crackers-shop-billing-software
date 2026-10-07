# 🚀 Multi-Device Deployment & Live Database Sync Guide

This billing software has built-in **Real-Time Multi-Device Database Synchronization (Server-Sent Events)**.

When you add or edit a cracker/item, create a bill, or change shop settings from **any** device (phone, iPad, laptop, counter PC), the changes reflect **instantly on all other connected devices** in real time!

---

## 📱 Method 1: Local Shop Multi-Counter / Mobile Setup (100% Free & Offline-Ready)

Use this method to run your main computer as the central database server, and connect multiple mobile phones, tablets, or other billing counters in your shop:

### Step 1: Start Central Server on Host PC / Laptop
1. Double-click **`start-pos.bat`** (or run `npm start`).
2. The server will start and display your Local Network IP (e.g. `http://192.168.1.15:5000`).

### Step 2: Connect Mobiles, iPads, or Other Laptops
1. Connect the mobile phones / iPads to the **same Wi-Fi router or Mobile Hotspot** as the host PC.
2. In the POS app on the host PC, click the **📱 Multi-Device Sync** button in the top navbar to view the **QR Code**.
3. Scan the QR code with any mobile camera, OR open the browser on the other device and type:
   ```
   http://192.168.1.15:5000
   ```
4. 🎉 **Done!** Every device is now connected to the same central database:
   - When Counter 1 adds an item or updates prices, Counter 2 & Mobiles see it immediately.
   - When Cashier bills an order on Mobile, it updates Today's Total Sales and Past Bills in real time across all screens!

---

## 🌐 Method 2: Free 24/7 Cloud Hosting (Render / Railway)

Deploy online so staff, managers, and shop owners can access the POS from anywhere across different locations or cities:

### Deploying to Render.com (100% Free):
1. Push this project to your GitHub account (or GitLab / Zip).
2. Create a free account at [render.com](https://render.com).
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository.
5. Configure Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build && cd server && npm install`
   - **Start Command**: `npm start`
6. Click **Create Web Service**.
7. Render gives you a live permanent HTTPS URL (e.g. `https://my-cracker-pos.onrender.com`).
8. Open this URL on any device anywhere in the world!

---

## ⚡ Method 3: Instant Free Public Tunnel (No Cloud Setup Needed)

If you want to access your local machine from outside the shop without deploying:

### Option A: Localtunnel (Zero Config)
Run in terminal on your host PC:
```bash
npx localtunnel --port 5000
```
It outputs a public HTTPS link (e.g. `https://fast-crackers.loca.lt`) you can open on any mobile device anywhere!

### Option B: Cloudflare Quick Tunnel
```bash
npx cloudflared tunnel --url http://localhost:5000
```

---

## 🐳 Method 4: Docker Container Deployment (VPS / AWS / DigitalOcean)

Run anywhere using Docker:
```bash
docker compose up -d --build
```
- Access live at `http://your-server-ip:5000`
- Data is persistently saved in `./server/data/`.

---

## 🔄 How Real-Time Live Sync Works
1. **Central Node Express DB API**: All devices communicate with the single central backend storing `products.json`, `bills.json`, and `settings.json`.
2. **Server-Sent Events (SSE)**: When any device triggers `POST/PUT/DELETE /api/products`, `POST /api/bills`, or `POST /api/settings`, the server broadcasts the event to all connected devices.
3. **Instant React State Refresh**: Connected devices update their UI and catalog instantly without page refreshes.
