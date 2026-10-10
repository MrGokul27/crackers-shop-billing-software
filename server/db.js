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

// ---------------- MONGODB CLOUD PERSISTENCE (FOR RENDER DEPLOYMENTS & LOCAL) ----------------
let mongoClient = null;
let mongoDb = null;
let isMongoConnected = false;

const DEFAULT_MONGODB_URI = 'mongodb+srv://gokulanathjp:Gokulanathjp27@cluster0.f2gn1zp.mongodb.net/cracker_pos?appName=Cluster0';
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || DEFAULT_MONGODB_URI;

export async function initMongo() {
  if (!MONGODB_URI) {
    console.log('ℹ️ Running in Local File Storage mode.');
    return false;
  }
  try {
    console.log('🔌 Connecting to MongoDB Atlas cloud database...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db('cracker_pos');
    isMongoConnected = true;
    console.log('✅ Successfully connected to MongoDB Atlas! Cloud persistence active for local & live Render.');

    // 1. Sync & Hydrate Products
    const remoteProducts = await mongoDb.collection('products').find({}).toArray();
    if (remoteProducts && remoteProducts.length > 0) {
      const cleanProds = remoteProducts.map(({ _id, ...rest }) => rest);
      writeJsonFile(PRODUCTS_FILE, cleanProds);
      console.log(`📦 Loaded ${cleanProds.length} products from MongoDB cloud.`);
    } else {
      const localProducts = readJsonFile(PRODUCTS_FILE, DEFAULT_PRODUCTS);
      if (localProducts && localProducts.length > 0) {
        await mongoDb.collection('products').insertMany(localProducts.map(p => ({ ...p })));
        console.log(`📦 Uploaded ${localProducts.length} local products to MongoDB cloud.`);
      }
    }

    // 2. Sync & Hydrate Settings
    const remoteSettings = await mongoDb.collection('settings').findOne({ id: 'app_settings' });
    if (remoteSettings) {
      const { _id, id, ...cleanSettings } = remoteSettings;
      writeJsonFile(SETTINGS_FILE, cleanSettings);
      console.log('⚙️ Loaded shop settings from MongoDB cloud.');
    } else {
      const localSettings = readJsonFile(SETTINGS_FILE, DEFAULT_SETTINGS);
      await mongoDb.collection('settings').updateOne(
        { id: 'app_settings' },
        { $set: { id: 'app_settings', ...localSettings } },
        { upsert: true }
      );
      console.log('⚙️ Uploaded shop settings to MongoDB cloud.');
    }

    // 3. Sync & Hydrate Bills
    const remoteBills = await mongoDb.collection('bills').find({}).sort({ createdAt: -1 }).toArray();
    if (remoteBills && remoteBills.length > 0) {
      const cleanBills = remoteBills.map(({ _id, ...rest }) => rest);
      writeJsonFile(BILLS_FILE, cleanBills);
      console.log(`🧾 Loaded ${cleanBills.length} past bills from MongoDB cloud.`);
    } else {
      const localBills = readJsonFile(BILLS_FILE, []);
      if (localBills && localBills.length > 0) {
        await mongoDb.collection('bills').insertMany(localBills.map(b => ({ ...b })));
        console.log(`🧾 Uploaded ${localBills.length} local bills to MongoDB cloud.`);
      }
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
