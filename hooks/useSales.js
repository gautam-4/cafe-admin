'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useSales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const salesQuery = query(
            collection(db, 'orders'),
            where('paymentStatus', '==', 'paid')
        );

        const unsubscribe = onSnapshot(
            salesQuery,
            (snapshot) => {
                const salesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort in memory by updatedAt descending
                salesData.sort((a, b) => {
                    const aTime = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
                    const bTime = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
                    return bTime - aTime;
                });

                setSales(salesData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching sales:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const getDateRange = (period, customRange = null) => {
        const now = new Date();
        let startDate, endDate;

        if (period === 'all') {
            return {
                startDate: new Date(2020, 0, 1), 
                endDate: now
            };
        }

        if (period === 'custom' && customRange) {
            const { startMonth, startYear, endMonth, endYear } = customRange;
            startDate = new Date(startYear, startMonth, 1);
            endDate = new Date(endYear, endMonth + 1, 1);
            return { startDate, endDate };
        }

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

    const getSalesAnalytics = (period = 'today', customRange = null) => {
        const { startDate, endDate } = getDateRange(period, customRange);

        const filteredSales = sales.filter(sale => {
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
                    const normalizedCategory = category.toLowerCase();
                    const pricePerCategory = sale.totalPrice / sale.summary.categories.length;
                    categoryBreakdown[normalizedCategory] = (categoryBreakdown[normalizedCategory] || 0) + pricePerCategory;
                });
            } else if (sale.items && sale.items.length > 0) {
                sale.items.forEach(item => {
                    const category = (item.category || 'unknown').toLowerCase();
                    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (item.itemTotal || 0);
                });
            }
        });

        // Hourly breakdown
        const hourlyBreakdown = {};
        filteredSales.forEach(sale => {
            let saleDate;
            if (sale.updatedAt && sale.updatedAt.toDate) {
                saleDate = sale.updatedAt.toDate();
            } else if (sale.createdAt && sale.createdAt.toDate) {
                saleDate = sale.createdAt.toDate();
            }
            
            if (saleDate) {
                const hour = saleDate.getHours();
                if (!hourlyBreakdown[hour]) {
                    hourlyBreakdown[hour] = { revenue: 0, orders: 0 };
                }
                hourlyBreakdown[hour].revenue += sale.totalPrice || 0;
                hourlyBreakdown[hour].orders += 1;
            }
        });

        // Day of week breakdown
        const dayBreakdown = {};
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        filteredSales.forEach(sale => {
            let saleDate;
            if (sale.updatedAt && sale.updatedAt.toDate) {
                saleDate = sale.updatedAt.toDate();
            } else if (sale.createdAt && sale.createdAt.toDate) {
                saleDate = sale.createdAt.toDate();
            }
            
            if (saleDate) {
                const day = days[saleDate.getDay()];
                if (!dayBreakdown[day]) {
                    dayBreakdown[day] = { revenue: 0, orders: 0 };
                }
                dayBreakdown[day].revenue += sale.totalPrice || 0;
                dayBreakdown[day].orders += 1;
            }
        });

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            categoryBreakdown,
            hourlyBreakdown,
            dayBreakdown,
            sales: filteredSales,
            dateRange: { startDate, endDate }
        };
    };

    const getAvailableYears = () => {
        const currentYear = new Date().getFullYear();
        const salesYears = new Set();

        sales.forEach(sale => {
            let saleDate;
            if (sale.updatedAt && sale.updatedAt.toDate) {
                saleDate = sale.updatedAt.toDate();
            } else if (sale.createdAt && sale.createdAt.toDate) {
                saleDate = sale.createdAt.toDate();
            } else if (sale.timestamp) {
                saleDate = new Date(sale.timestamp);
            }

            if (saleDate) {
                salesYears.add(saleDate.getFullYear());
            }
        });

        const allYears = new Set([currentYear, ...salesYears]);

        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
            allYears.add(year);
        }

        return Array.from(allYears).sort((a, b) => b - a);
    };

    return {
        sales,
        loading,
        error,
        getSalesAnalytics,
        getAvailableYears
    };
};