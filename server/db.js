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

// Initial Realistic Seed Products for Cracker Shop
const DEFAULT_PRODUCTS = [
  // Sparklers (கம்பி மத்தாப்பு)
  { id: 'p1', name: '10cm Electric Sparklers', category: 'Sparklers', price: 45, mrp: 75, barcode: '8901001', emoji: '✨', unit: 'Box', inStock: true },
  { id: 'p2', name: '10cm Color Sparklers', category: 'Sparklers', price: 55, mrp: 85, barcode: '8901002', emoji: '🎇', unit: 'Box', inStock: true },
  { id: 'p3', name: '15cm Electric Sparklers', category: 'Sparklers', price: 90, mrp: 140, barcode: '8901003', emoji: '✨', unit: 'Box', inStock: true },
  { id: 'p4', name: '30cm Giant Sparklers (5 Pcs)', category: 'Sparklers', price: 160, mrp: 250, barcode: '8901004', emoji: '🎆', unit: 'Box', inStock: true },
  { id: 'p5', name: '50cm Mega Wonder Sparklers', category: 'Sparklers', price: 280, mrp: 450, barcode: '8901005', emoji: '✨', unit: 'Box', inStock: true },

  // Flower Pots (பூந்தொட்டி)
  { id: 'p6', name: 'Flower Pot - Small (10 Pcs)', category: 'Flower Pots', price: 120, mrp: 200, barcode: '8902001', emoji: '🪴', unit: 'Box', inStock: true },
  { id: 'p7', name: 'Flower Pot - Big Special', category: 'Flower Pots', price: 180, mrp: 300, barcode: '8902002', emoji: '🏺', unit: 'Box', inStock: true },
  { id: 'p8', name: 'Flower Pot - Ashoka Giant', category: 'Flower Pots', price: 240, mrp: 400, barcode: '8902003', emoji: '⛲', unit: 'Box', inStock: true },
  { id: 'p9', name: 'Color Koti Deluxe Flower Pot', category: 'Flower Pots', price: 320, mrp: 500, barcode: '8902004', emoji: '🌸', unit: 'Box', inStock: true },

  // Ground Chakkars (தரை சக்கரம்)
  { id: 'p10', name: 'Ground Chakra - Special (10 Pcs)', category: 'Chakra', price: 110, mrp: 180, barcode: '8903001', emoji: '🌀', unit: 'Box', inStock: true },
  { id: 'p11', name: 'Ground Chakra - Deluxe Big', category: 'Chakra', price: 170, mrp: 280, barcode: '8903002', emoji: '🎡', unit: 'Box', inStock: true },
  { id: 'p12', name: 'Spinner Wheel / Disco Chakra', category: 'Chakra', price: 210, mrp: 350, barcode: '8903003', emoji: '💫', unit: 'Box', inStock: true },

  // Rockets (ராக்கெட்)
  { id: 'p13', name: 'Baby Rocket (10 Pcs)', category: 'Rockets', price: 95, mrp: 160, barcode: '8904001', emoji: '🚀', unit: 'Box', inStock: true },
  { id: 'p14', name: 'Whistling Bomb Rocket', category: 'Rockets', price: 180, mrp: 300, barcode: '8904002', emoji: '🚀', unit: 'Box', inStock: true },
  { id: 'p15', name: 'Lunik Sound Rocket (10 Pcs)', category: 'Rockets', price: 260, mrp: 420, barcode: '8904003', emoji: '🌌', unit: 'Box', inStock: true },

  // Garlands / WALA (சரவெடி)
  { id: 'p16', name: '100 Wala Red Garland', category: 'Garlands', price: 65, mrp: 110, barcode: '8905001', emoji: '🧨', unit: 'Pkt', inStock: true },
  { id: 'p17', name: '1000 Wala Deluxe Garland', category: 'Garlands', price: 420, mrp: 700, barcode: '8905002', emoji: '🧧', unit: 'Pkt', inStock: true },
  { id: 'p18', name: '2000 Wala Heavy Garland', category: 'Garlands', price: 820, mrp: 1350, barcode: '8905003', emoji: '🧨', unit: 'Pkt', inStock: true },
  { id: 'p19', name: '5000 Wala Festival Garland', category: 'Garlands', price: 1850, mrp: 3000, barcode: '8905004', emoji: '💥', unit: 'Pkt', inStock: true },

  // Bombs & Sound Crackers (வெடி)
  { id: 'p20', name: '28 Chorsa Red Crackers', category: 'Sound Crackers', price: 35, mrp: 60, barcode: '8906001', emoji: '💥', unit: 'Pkt', inStock: true },
  { id: 'p21', name: 'Bijili Crackers (100 Pcs)', category: 'Sound Crackers', price: 50, mrp: 80, barcode: '8906002', emoji: '⚡', unit: 'Pkt', inStock: true },
  { id: 'p22', name: 'Hydro Bomb Green (10 Pcs)', category: 'Sound Crackers', price: 130, mrp: 220, barcode: '8906003', emoji: '💣', unit: 'Box', inStock: true },
  { id: 'p23', name: 'King of King Classic Bomb', category: 'Sound Crackers', price: 190, mrp: 310, barcode: '8906004', emoji: '💣', unit: 'Box', inStock: true },

  // Sky Shots & Aerial Fireworks (வானவேடிக்கை)
  { id: 'p24', name: '7 Shots Multi Color Sky Repeater', category: 'Sky Shots', price: 160, mrp: 280, barcode: '8907001', emoji: '🎆', unit: 'Pce', inStock: true },
  { id: 'p25', name: '12 Shots Night Queen Sky Shot', category: 'Sky Shots', price: 350, mrp: 580, barcode: '8907002', emoji: '🌠', unit: 'Box', inStock: true },
  { id: 'p26', name: '30 Shots Mega Galaxy Aerial Shot', category: 'Sky Shots', price: 780, mrp: 1300, barcode: '8907003', emoji: '🎇', unit: 'Box', inStock: true },
  { id: 'p27', name: '60 Shots Royal Celebration Aerial', category: 'Sky Shots', price: 1650, mrp: 2700, barcode: '8907004', emoji: '🎆', unit: 'Box', inStock: true },

  // Kids Special (சிறுவர் ஸ்பெஷல்)
  { id: 'p28', name: 'Snake Eggs / Black Serpent (10 Boxes)', category: 'Kids Special', price: 40, mrp: 70, barcode: '8908001', emoji: '🐍', unit: 'Pkt', inStock: true },
  { id: 'p29', name: 'Magic Pops / Pop Pop (50 Pcs)', category: 'Kids Special', price: 30, mrp: 50, barcode: '8908002', emoji: '🍿', unit: 'Pkt', inStock: true },
  { id: 'p30', name: 'Color Smoke Fountain (5 Pcs)', category: 'Kids Special', price: 140, mrp: 230, barcode: '8908003', emoji: '💨', unit: 'Box', inStock: true },
  { id: 'p31', name: 'Peacock Dance / Mayil Fountain', category: 'Kids Special', price: 190, mrp: 320, barcode: '8908004', emoji: '🦚', unit: 'Box', inStock: true },

  // Gift Boxes (ஸ்பெஷல் கிப்ட் பாக்ஸ்)
  { id: 'p32', name: 'Standard Family Gift Box (25 Items)', category: 'Gift Box', price: 650, mrp: 1200, barcode: '8909001', emoji: '🎁', unit: 'Box', inStock: true },
  { id: 'p33', name: 'Royal Mega Festival Gift Box (45 Items)', category: 'Gift Box', price: 1350, mrp: 2500, barcode: '8909002', emoji: '🎁', unit: 'Box', inStock: true },
  { id: 'p34', name: 'V.I.P Luxury Crackers Hamper (60 Items)', category: 'Gift Box', price: 2400, mrp: 4500, barcode: '8909003', emoji: '👑', unit: 'Box', inStock: true }
];

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
