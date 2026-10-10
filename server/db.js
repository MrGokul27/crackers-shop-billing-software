import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  cashierName: 'Kumar (Cashier 1)',
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

export const db = {
  getProducts: () => readJsonFile(PRODUCTS_FILE, DEFAULT_PRODUCTS),
  saveProducts: (products) => writeJsonFile(PRODUCTS_FILE, products),
  
  getBills: () => readJsonFile(BILLS_FILE, []),
  saveBills: (bills) => writeJsonFile(BILLS_FILE, bills),
  
  getSettings: () => readJsonFile(SETTINGS_FILE, DEFAULT_SETTINGS),
  saveSettings: (settings) => writeJsonFile(SETTINGS_FILE, settings)
};
