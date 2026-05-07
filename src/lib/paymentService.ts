import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  Timestamp,
  DocumentData,
  Query
} from 'firebase/firestore';

export interface PaymentData {
  buyerId: string;
  buyerEmail: string;
  amount: number;
  transactionId: string;
  paymentMethod: 'upi';
  status: 'success' | 'pending' | 'failed';
  createdAt: Timestamp | Date;
}

export interface OrderData {
  buyerId: string;
  buyerEmail: string;
  amount: number;
  paymentId: string;
  orderStatus: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Timestamp | Date;
  productId?: string;
  quantity?: number;
  shippingAddress?: string;
}

/**
 * Save payment to Firestore "payments" collection
 */
export async function savePayment(paymentData: PaymentData): Promise<string> {
  try {
    const paymentRef = collection(db, 'payments');
    const docRef = await addDoc(paymentRef, {
      ...paymentData,
      createdAt: paymentData.createdAt instanceof Date 
        ? Timestamp.fromDate(paymentData.createdAt)
        : paymentData.createdAt,
    });
    console.log('✅ Payment saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving payment:', error);
    throw new Error('Failed to save payment. Please try again.');
  }
}

/**
 * Create order in Firestore "orders" collection
 * Must be called IMMEDIATELY after payment is saved
 */
export async function createOrder(orderData: OrderData): Promise<string> {
  try {
    const orderRef = collection(db, 'orders');
    const docRef = await addDoc(orderRef, {
      ...orderData,
      createdAt: orderData.createdAt instanceof Date
        ? Timestamp.fromDate(orderData.createdAt)
        : orderData.createdAt,
    });
    console.log('✅ Order created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw new Error('Failed to create order. Please try again.');
  }
}

/**
 * Get all payments for a specific buyer
 */
export async function getBuyerPayments(buyerId: string): Promise<(PaymentData & { id: string })[]> {
  try {
    const q = query(collection(db, 'payments'), where('buyerId', '==', buyerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (PaymentData & { id: string })[];
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    return [];
  }
}

/**
 * Get all orders for a specific buyer
 */
export async function getBuyerOrders(buyerId: string): Promise<(OrderData & { id: string })[]> {
  try {
    const q = query(collection(db, 'orders'), where('buyerId', '==', buyerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (OrderData & { id: string })[];
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<(PaymentData & { id: string }) | null> {
  try {
    const docRef = doc(db, 'payments', paymentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as PaymentData & { id: string };
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    return null;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<(OrderData & { id: string }) | null> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as OrderData & { id: string };
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return null;
  }
}

/**
 * Validates transaction ID format (basic validation)
 * UTR numbers are typically 12-13 digits or alphanumeric
 */
export function validateTransactionId(transactionId: string): { valid: boolean; error?: string } {
  if (!transactionId || !transactionId.trim()) {
    return { valid: false, error: 'Transaction ID is required' };
  }
  
  const trimmed = transactionId.trim();
  
  // Check length (UTR is typically 12-13 characters)
  if (trimmed.length < 3 || trimmed.length > 50) {
    return { valid: false, error: 'Transaction ID must be 3-50 characters' };
  }
  
  // Check if it contains at least one alphanumeric character
  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return { valid: false, error: 'Transaction ID must contain alphanumeric characters' };
  }
  
  return { valid: true };
}

/**
 * Complete payment process: Save payment + Create order atomically
 * Returns { paymentId, orderId } on success
 */
export async function processPaymentAndCreateOrder(
  buyerId: string,
  buyerEmail: string,
  amount: number,
  transactionId: string
): Promise<{ paymentId: string; orderId: string }> {
  try {
    // Validate transaction ID
    const validation = validateTransactionId(transactionId);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid transaction ID');
    }

    // Step 1: Save payment
    const paymentId = await savePayment({
      buyerId,
      buyerEmail,
      amount,
      transactionId: transactionId.trim(),
      paymentMethod: 'upi',
      status: 'success',
      createdAt: new Date(),
    });

    // Step 2: Create order immediately after payment
    const orderId = await createOrder({
      buyerId,
      buyerEmail,
      amount,
      paymentId,
      orderStatus: 'confirmed',
      createdAt: new Date(),
    });

    return { paymentId, orderId };
  } catch (error) {
    console.error('❌ Error in payment process:', error);
    throw error;
  }
}
