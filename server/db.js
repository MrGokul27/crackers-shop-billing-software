import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BILLS_FILE = path.join(DATA_DIR, 'bills.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Empty initial products list so user can add products from scratch
const DEFAULT_PRODUCTS = [];

const DEFAULT_SETTINGS = {
  shopName: '🎆 SRI KRISHNA CRACKERS',
  tagline: 'Direct Factory Sivakasi Crackers at Wholesale Price',
  address: 'No. 12, Gandhi Bazaar Main Road, Sivakasi / Chennai',
  phone: '+91 98765 43210',
  cashierName: 'Owner/Admin',
  cashierPin: '1234',
  upiId: 'crackerstore@upi',
  printerType: 'thermal80', // 'thermal80', 'thermal58', 'a4'
  footerNote: '✨ HAPPY DIWALI & SAFE CELEBRATIONS! ✨\nItems once sold cannot be exchanged or returned.',
  discountEnabled: true,
  autoPrintReceipt: true,
  currencySymbol: '₹'
};

function readJsonFile(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// ---------------- MONGODB CLOUD PERSISTENCE (FOR RENDER DEPLOYMENTS) ----------------
let mongoClient = null;
let mongoDb = null;
let isMongoConnected = false;

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

export async function initMongo() {
  if (!MONGODB_URI) {
    console.log('ℹ️ Local File Storage active. (Optional: Set MONGODB_URI in Render Environment Variables for permanent cloud database across all devices).');
    return false;
  }
  try {
    console.log('🔌 Connecting to MongoDB Atlas cloud database...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isMongoConnected = true;
    console.log('✅ Successfully connected to MongoDB Atlas! Cloud persistence active.');

    // Hydrate local cache from MongoDB on startup
    const remoteProducts = await mongoDb.collection('products').find({}).toArray();
    if (remoteProducts && remoteProducts.length > 0) {
      const cleanProds = remoteProducts.map(({ _id, ...rest }) => rest);
      writeJsonFile(PRODUCTS_FILE, cleanProds);
      console.log(`📦 Restored ${cleanProds.length} products from cloud database.`);
    }

    const remoteSettings = await mongoDb.collection('settings').findOne({ id: 'app_settings' });
    if (remoteSettings) {
      const { _id, id, ...cleanSettings } = remoteSettings;
      writeJsonFile(SETTINGS_FILE, cleanSettings);
      console.log('⚙️ Restored shop settings from cloud database.');
    }

    const remoteBills = await mongoDb.collection('bills').find({}).sort({ createdAt: -1 }).toArray();
    if (remoteBills && remoteBills.length > 0) {
      const cleanBills = remoteBills.map(({ _id, ...rest }) => rest);
      writeJsonFile(BILLS_FILE, cleanBills);
      console.log(`🧾 Restored ${cleanBills.length} past bills from cloud database.`);
    }

    return true;
  } catch (err) {
    console.error('⚠️ MongoDB connection failed, falling back to local files:', err.message);
    isMongoConnected = false;
    return false;
  }
}

export const db = {
  isCloudConnected: () => isMongoConnected,

  getProducts: () => readJsonFile(PRODUCTS_FILE, DEFAULT_PRODUCTS),
  saveProducts: (products) => {
    writeJsonFile(PRODUCTS_FILE, products);
    if (isMongoConnected && mongoDb) {
      (async () => {
        try {
          const col = mongoDb.collection('products');
          await col.deleteMany({});
          if (products && products.length > 0) {
            await col.insertMany(products.map(p => ({ ...p })));
          }
        } catch (e) {
          console.error('Error syncing products to MongoDB:', e.message);
        }
      })();
    }
  },
  
  getBills: () => readJsonFile(BILLS_FILE, []),
  saveBills: (bills) => {
    writeJsonFile(BILLS_FILE, bills);
    if (isMongoConnected && mongoDb) {
      (async () => {
        try {
          const col = mongoDb.collection('bills');
          await col.deleteMany({});
          if (bills && bills.length > 0) {
            await col.insertMany(bills.map(b => ({ ...b })));
          }
        } catch (e) {
          console.error('Error syncing bills to MongoDB:', e.message);
        }
      })();
    }
  },
  
  getSettings: () => readJsonFile(SETTINGS_FILE, DEFAULT_SETTINGS),
  saveSettings: (settings) => {
    writeJsonFile(SETTINGS_FILE, settings);
    if (isMongoConnected && mongoDb) {
      (async () => {
        try {
          await mongoDb.collection('settings').updateOne(
            { id: 'app_settings' },
            { $set: { id: 'app_settings', ...settings } },
            { upsert: true }
          );
        } catch (e) {
          console.error('Error syncing settings to MongoDB:', e.message);
        }
      })();
    }
  }
};
