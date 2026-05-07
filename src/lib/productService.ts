/**
 * Product Initialization Utility
 * Use this to set up initial products in Firestore with correct names
 */

import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { PRODUCTS } from '@/assets/products';

export interface FirestoreProduct {
  name: string;
  category: string;
  description: string;
  image?: string;
  domesticPrice: number;
  exportPrice: number;
  quantity: number;
  unit: string;
  shippingType: string;
  exportAvailable: boolean;
  packaging: string;
  farmerName: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Initialize all products in Firestore
 * Run this once to set up the product catalog
 */
export const initializeProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const timestamp = new Date().toISOString();

    for (const product of PRODUCTS) {
      const docRef = doc(productsRef, product.id);
      
      const firestoreProduct: FirestoreProduct = {
        name: product.name,
        category: product.category,
        description: product.description,
        image: product.image || '',
        domesticPrice: product.domesticPrice,
        exportPrice: product.exportPrice,
        quantity: 1000, // Default quantity
        unit: 'pcs',
        shippingType: 'sea',
        exportAvailable: true,
        packaging: 'Standard',
        farmerName: 'Shastika Farm',
        location: 'India',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await setDoc(docRef, firestoreProduct, { merge: true });
      console.log(`✅ Initialized product: ${product.name}`);
    }

    console.log('✅ All products initialized successfully!');
    return { success: true, count: PRODUCTS.length };
  } catch (error) {
    console.error('❌ Error initializing products:', error);
    throw error;
  }
};

/**
 * Get product by ID from Firestore
 */
export const getProductFromFirestore = async (productId: string) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('__name__', '==', productId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn(`Product not found: ${productId}`);
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Verify product names in Firestore
 */
export const verifyProductNames = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    console.log('📋 Products in Firestore:');
    const names: string[] = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      names.push(data.name);
      console.log(`  • ${data.name} (ID: ${doc.id})`);
    });

    return names;
  } catch (error) {
    console.error('❌ Error verifying products:', error);
    throw error;
  }
};

/**
 * Update product name in Firestore
 */
export const updateProductName = async (productId: string, newName: string) => {
  try {
    const docRef = doc(db, 'products', productId);
    await setDoc(docRef, { 
      name: newName,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`✅ Updated product name: ${productId} → ${newName}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating product name:', error);
    throw error;
  }
};

/**
 * Rename multiple products
 */
export const renameProducts = async (updates: Record<string, string>) => {
  try {
    const results = [];
    for (const [productId, newName] of Object.entries(updates)) {
      await updateProductName(productId, newName);
      results.push({ productId, newName });
    }
    console.log(`✅ Renamed ${results.length} products`);
    return results;
  } catch (error) {
    console.error('❌ Error renaming products:', error);
    throw error;
  }
};
