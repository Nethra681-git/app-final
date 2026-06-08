/**
 * Product Catalog - Shastika Global Exports
 * Premium export-grade fresh produce directly from India
 * All products carefully selected, graded, and packed to international standards
 */

import cavendish from "./banana-pd.png";
import redbanana from "./redbanana-pd.png";
import nendran from "./nendranbanana-pd.png";
import babybanana from "./babybanana-pd.png";

import tender from "./tendercoconut-pd (1).png";
import dehusked from "./dehusked-pd.png";
import semihusked from "./semihusked-pd.png";

import watermelon from "./watermelon-product.png";
import blackwatermelon from "./blackwatermelon-pd.png";
import yellowpumpkin from "./yellowpumpkin-pd2.png";
import whitepumpkin from "./whitepumpkin-pd.png";
import cucumber from "./cucumber-product.png";
import tomato from "./tomato.png";

export const PRODUCTS = [
  // BANANAS - Export Grade
  { id: 'cavendish-banana', name: 'Cavendish Banana', category: 'Bananas', description: 'Premium quality Cavendish bananas ideal for international export. Known for consistent size, taste and extended shelf life.', image: cavendish, farmerName: 'Raju Farms', location: 'Tamil Nadu, India', domesticPrice: 7, exportPrice: 12, quantity: 10000, unit: 'kg', shippingType: 'Sea Way / Air Way', exportAvailable: true, packaging: 'Corrugated boxes with poly liners' },
  { id: 'red-banana', name: 'Red Banana', category: 'Bananas', description: 'Sweet red bananas with creamy texture. High demand in Middle East and European markets.', image: redbanana, farmerName: 'Kumar Plantations', location: 'Kerala, India', domesticPrice: 15, exportPrice: 22, quantity: 5000, unit: 'kg', shippingType: 'Air Way', exportAvailable: true, packaging: 'Ventilated cartons' },
  { id: 'nendran-banana', name: 'Nendran Banana', category: 'Bananas', description: 'Large cooking banana popular for chips and traditional dishes.', image: nendran, farmerName: 'Anand Farms', location: 'Kerala, India', domesticPrice: 20, exportPrice: 30, quantity: 8000, unit: 'kg', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Wooden crates' },
  { id: 'baby-banana', name: 'Baby Banana', category: 'Bananas', description: 'Small sweet bananas, perfect for snacking and gourmet applications.', image: babybanana, farmerName: 'Lakshmi Farms', location: 'Karnataka, India', domesticPrice: 25, exportPrice: 35, quantity: 3000, unit: 'kg', shippingType: 'Air Way', exportAvailable: true, packaging: 'Gift-grade cartons' },

  // COCONUT PRODUCTS - Export Grade
  { id: 'tender-coconut', name: 'Tender Coconut (Export Grade)', category: 'Coconut', description: 'Fresh tender coconuts with natural water & soft kernel - export quality.', image: tender, farmerName: 'Selvam Estate', location: 'Tamil Nadu, India', domesticPrice: 30, exportPrice: 50, quantity: 15000, unit: 'pcs', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Shrink-wrapped pallets' },
  { id: 'green-coconut', name: 'Green Coconut', category: 'Coconut', description: 'Green coconuts rich in water content, ideal for juice and cooking.', image: tender, farmerName: 'Murugan Farms', location: 'Tamil Nadu, India', domesticPrice: 25, exportPrice: 40, quantity: 12000, unit: 'pcs', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Netted bags on pallets' },
  { id: 'husked-coconut', name: 'Husked Coconut', category: 'Coconut', description: 'Fully husked mature coconuts for copra and oil extraction.', image: dehusked, farmerName: 'Palani Estates', location: 'Coimbatore, India', domesticPrice: 18, exportPrice: 28, quantity: 20000, unit: 'pcs', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Jute bags' },
  { id: 'semi-husked-coconut', name: 'Semi Husked Coconut', category: 'Coconut', description: 'Semi husked coconuts retaining protective layers for longer shelf life.', image: semihusked, farmerName: 'Vijay Farms', location: 'Pollachi, India', domesticPrice: 20, exportPrice: 32, quantity: 18000, unit: 'pcs', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Container loading' },
  { id: 'dehusked-coconut', name: 'Dehusked Coconut', category: 'Coconut', description: 'Completely dehusked and polished coconuts ready for retail markets.', image: dehusked, farmerName: 'Siva Coconuts', location: 'Thanjavur, India', domesticPrice: 22, exportPrice: 35, quantity: 10000, unit: 'pcs', shippingType: 'Sea Way / Air Way', exportAvailable: true, packaging: 'Retail cartons' },

  // VEGETABLES & FRUITS - Organic Export Grade
  { id: 'watermelon', name: 'Watermelon', category: 'Fruits', description: 'Large sweet watermelons, juicy and refreshing for summer export demand.', image: watermelon, farmerName: 'Ganesh Agro', location: 'Andhra Pradesh, India', domesticPrice: 10, exportPrice: 18, quantity: 25000, unit: 'kg', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Bulk bins' },
  { id: 'black-watermelon', name: 'Black Diamond Watermelon', category: 'Fruits', description: 'Premium Black Diamond variety – export grade organic, naturally grown.', image: blackwatermelon, farmerName: 'Ganesh Agro', location: 'Andhra Pradesh, India', domesticPrice: 15, exportPrice: 25, quantity: 8000, unit: 'kg', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Ventilated crates' },
  { id: 'yellow-pumpkin', name: 'Yellow Pumpkin', category: 'Vegetables', description: 'Bright yellow pumpkins rich in nutrients. Used in soups and curries.', image: yellowpumpkin, farmerName: 'Prakash Farms', location: 'Maharashtra, India', domesticPrice: 12, exportPrice: 20, quantity: 8000, unit: 'kg', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Mesh bags' },
  { id: 'white-pumpkin', name: 'White Pumpkin', category: 'Vegetables', description: 'Ash gourd / white pumpkin known for medicinal and culinary uses.', image: whitepumpkin, farmerName: 'Deepa Agri', location: 'Gujarat, India', domesticPrice: 8, exportPrice: 15, quantity: 6000, unit: 'kg', shippingType: 'Sea Way', exportAvailable: true, packaging: 'Ventilated crates' },
  { id: 'yellow-cucumber', name: 'Yellow Cucumber', category: 'Vegetables', description: 'Yellow organic cucumbers – hygienic processing, excellent shelf life.', image: cucumber, farmerName: 'Ramesh Farms', location: 'Tamil Nadu, India', domesticPrice: 15, exportPrice: 25, quantity: 4000, unit: 'kg', shippingType: 'Air Way', exportAvailable: true, packaging: 'Perforated poly bags' },
  { id: 'tomato', name: 'Tomato', category: 'Vegetables', description: 'Fresh vine-ripened tomatoes for cooking and processing.', image: tomato, farmerName: 'Sundar Farms', location: 'Karnataka, India', domesticPrice: 20, exportPrice: 30, quantity: 15000, unit: 'kg', shippingType: 'Air Way', exportAvailable: true, packaging: 'Layered cartons' }
];

export const PRODUCT_CATEGORIES = [
  'Coconut',
  'Vegetables',
  'Fruits',
  'Bananas'
];

export const getProductById = (id: string) => {
  return PRODUCTS.find(p => p.id === id);
};

export const getProductsByCategory = (category: string) => {
  return PRODUCTS.filter(p => p.category === category);
};
