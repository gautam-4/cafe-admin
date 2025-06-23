'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData = {
        status: newStatus,
        updatedAt: Timestamp.now()
      };

      // If marking as paid, also update payment status
      if (newStatus === 'paid') {
        updateData.paymentStatus = 'paid';
      }

      await updateDoc(orderRef, updateData);
      return { success: true };
    } catch (err) {
      console.error('Error updating order status:', err);
      throw new Error('Failed to update order status: ' + err.message);
    }
  };

  return { orders, loading, error, updateOrderStatus };
};