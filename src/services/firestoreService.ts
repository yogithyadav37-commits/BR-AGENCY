import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy
} from '../firebase';
import { Order, Invoice, StockItem, StockRequest, CustomerProfile } from '../types/ink';

export const FirestoreService = {
  // Sync Order to Firestore
  async saveOrder(order: Order): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await setDoc(orderRef, {
        ...order,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveOrder failed (falling back to local):', err);
    }
  },

  // Sync Invoice to Firestore
  async saveInvoice(invoice: Invoice): Promise<void> {
    try {
      const invoiceRef = doc(db, 'invoices', invoice.id);
      await setDoc(invoiceRef, {
        ...invoice,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveInvoice failed:', err);
    }
  },

  // Sync Stock Request to Firestore
  async saveStockRequest(request: StockRequest): Promise<void> {
    try {
      const reqRef = doc(db, 'stock_requests', request.id);
      await setDoc(reqRef, {
        ...request,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveStockRequest failed:', err);
    }
  },

  // Sync User / Company Profile to Firestore
  async saveUserProfile(userId: string, profile: Partial<CustomerProfile> & { email?: string; displayName?: string; photoURL?: string }): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveUserProfile failed:', err);
    }
  },

  // Subscribe to Orders in real time
  subscribeOrders(onUpdate: (orders: Order[]) => void): () => void {
    try {
      const ordersCol = collection(db, 'orders');
      return onSnapshot(ordersCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Order);
          });
          onUpdate(list);
        }
      }, (err) => {
        console.warn('Firestore orders subscription error:', err);
      });
    } catch (e) {
      console.warn('Error setting up orders subscription:', e);
      return () => {};
    }
  },

  // Subscribe to Invoices in real time
  subscribeInvoices(onUpdate: (invoices: Invoice[]) => void): () => void {
    try {
      const invCol = collection(db, 'invoices');
      return onSnapshot(invCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: Invoice[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Invoice);
          });
          onUpdate(list);
        }
      }, (err) => {
        console.warn('Firestore invoices subscription error:', err);
      });
    } catch (e) {
      console.warn('Error setting up invoices subscription:', e);
      return () => {};
    }
  },

  // Subscribe to Stock Requests
  subscribeStockRequests(onUpdate: (requests: StockRequest[]) => void): () => void {
    try {
      const reqCol = collection(db, 'stock_requests');
      return onSnapshot(reqCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: StockRequest[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as StockRequest);
          });
          onUpdate(list);
        }
      }, (err) => {
        console.warn('Firestore stock requests subscription error:', err);
      });
    } catch (e) {
      console.warn('Error setting up stock requests subscription:', e);
      return () => {};
    }
  }
};
