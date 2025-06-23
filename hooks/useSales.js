'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useSales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Query for orders with paymentStatus 'paid' instead of status 'paid'
        const salesQuery = query(
            collection(db, 'orders'),
            where('paymentStatus', '==', 'paid'),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            salesQuery,
            (snapshot) => {
                const salesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSales(salesData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching sales:', err);

                // Handle specific Firestore errors
                if (err.code === 'failed-precondition' && err.message.includes('index')) {
                    setError('Database index required. Please create a composite index for orders collection with fields: paymentStatus (Ascending), updatedAt (Descending)');
                } else {
                    setError(err.message);
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const getDateRange = (period) => {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;

            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                startDate = startOfWeek;

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 7);
                endDate = endOfWeek;
                break;

            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;

            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear() + 1, 0, 1);
                break;

            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        }

        return { startDate, endDate };
    };


    const getSalesAnalytics = (period = 'today') => {
        const { startDate, endDate } = getDateRange(period);

        const filteredSales = sales.filter(sale => {
            // Handle both Firebase Timestamp and regular Date objects
            let saleDate;
            if (sale.updatedAt && sale.updatedAt.toDate) {
                saleDate = sale.updatedAt.toDate();
            } else if (sale.createdAt && sale.createdAt.toDate) {
                saleDate = sale.createdAt.toDate();
            } else if (sale.timestamp) {
                saleDate = new Date(sale.timestamp);
            } else {
                saleDate = new Date();
            }

            return saleDate >= startDate && saleDate < endDate;
        });

        const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
        const totalOrders = filteredSales.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Category breakdown
        const categoryBreakdown = {};
        filteredSales.forEach(sale => {
            if (sale.summary && sale.summary.categories) {
                sale.summary.categories.forEach(category => {
                    // Distribute the total price equally among categories for this sale
                    const pricePerCategory = sale.totalPrice / sale.summary.categories.length;
                    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + pricePerCategory;
                });
            } else if (sale.items && sale.items.length > 0) {
                // Fallback: use item categories if summary not available
                sale.items.forEach(item => {
                    const category = item.category || 'unknown';
                    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (item.itemTotal || 0);
                });
            }
        });

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            categoryBreakdown,
            sales: filteredSales
        };
    };

    return { sales, loading, error, getSalesAnalytics };
};