'use client';

import { useState } from 'react';
import OrderCard from './OrderCard';
import { useOrders } from '../hooks/useOrders';
import { AlertCircle, RefreshCw, ChefHat } from 'lucide-react';

const OrdersTab = () => {
  const { orders, loading, error, updateOrderStatus } = useOrders();
  const [activeFilter, setActiveFilter] = useState('active');

  const statusCounts = {
    active: orders.filter(o => ['pending', 'preparing', 'prepared'].includes(o.status)).length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    prepared: orders.filter(o => o.status === 'prepared').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'active':
        return orders.filter(o => ['pending', 'preparing', 'prepared'].includes(o.status));
      case 'pending':
        return orders.filter(o => o.status === 'pending');
      case 'preparing':
        return orders.filter(o => o.status === 'preparing');
      case 'prepared':
        return orders.filter(o => o.status === 'prepared');
      case 'cancelled':
        return orders.filter(o => o.status === 'cancelled');
      default:
        return orders.filter(o => ['pending', 'preparing', 'prepared'].includes(o.status));
    }
  };

  const filteredOrders = getFilteredOrders();

  const filters = [
    { 
      key: 'active', 
      label: 'Active', 
      count: statusCounts.active,
      color: 'bg-blue-500 text-white',
      hoverColor: 'hover:bg-blue-600'
    },
    { 
      key: 'pending', 
      label: 'Pending', 
      count: statusCounts.pending,
      color: 'bg-yellow-500 text-white',
      hoverColor: 'hover:bg-yellow-600'
    },
    { 
      key: 'preparing', 
      label: 'Preparing', 
      count: statusCounts.preparing,
      color: 'bg-blue-600 text-white',
      hoverColor: 'hover:bg-blue-700'
    },
    { 
      key: 'prepared', 
      label: 'Ready', 
      count: statusCounts.prepared,
      color: 'bg-green-500 text-white',
      hoverColor: 'hover:bg-green-600'
    },
    { 
      key: 'cancelled', 
      label: 'Cancelled', 
      count: statusCounts.cancelled,
      color: 'bg-red-500 text-white',
      hoverColor: 'hover:bg-red-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <span className="block mt-2 text-gray-600">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <span className="block font-medium">Error loading orders</span>
          <span className="block text-sm mt-1">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{statusCounts.active}</div>
          <div className="text-sm opacity-90">Active Orders</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{statusCounts.pending}</div>
          <div className="text-sm opacity-90">Pending</div>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{statusCounts.preparing}</div>
          <div className="text-sm opacity-90">Preparing</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{statusCounts.prepared}</div>
          <div className="text-sm opacity-90">Ready</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto mb-6">
        <div className="flex gap-2 pb-2 min-w-max">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.key
                  ? filter.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="block">{filter.label}</span>
              <span className="block text-xs opacity-75">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeFilter === 'active' ? 'active' : activeFilter} orders
            </h3>
            <p className="text-gray-600">
              {activeFilter === 'active' 
                ? 'All caught up! New orders will appear here.' 
                : `No ${activeFilter} orders at the moment.`
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={updateOrderStatus}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredOrders.length} {activeFilter} order{filteredOrders.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;