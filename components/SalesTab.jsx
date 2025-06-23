'use client';

import { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  BarChart3,
  RefreshCw,
  AlertCircle,
  Calendar,
  PieChart,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';

const SalesTab = () => {
  const { sales, loading, error, getSalesAnalytics } = useSales();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const analytics = getSalesAnalytics(selectedPeriod);

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year'}
  ];

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <span className="block mt-2 text-gray-600">Loading sales data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <span className="block font-medium">Error loading sales data</span>
          <span className="block text-sm mt-1">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-green-200 text-xs mt-1">From paid orders</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Completed Orders</p>
              <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              <p className="text-blue-200 text-xs mt-1">Paid orders only</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold">₹{Math.round(analytics.avgOrderValue)}</p>
              <p className="text-purple-200 text-xs mt-1">Per completed order</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(analytics.categoryBreakdown).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Category Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.categoryBreakdown)
              .sort(([,a], [,b]) => b - a) // Sort by revenue descending
              .map(([category, revenue]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 capitalize">{category}</span>
                  <span className="text-lg font-bold text-green-600">₹{Math.round(revenue).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${analytics.totalRevenue > 0 ? (revenue / analytics.totalRevenue) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {analytics.totalRevenue > 0 ? ((revenue / analytics.totalRevenue) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Sales ({selectedPeriod})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {analytics.sales.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">No sales yet</p>
              <p className="text-gray-600">Sales will appear here once orders are marked as paid.</p>
              <div className="mt-4 text-sm text-gray-500">
                Current order statuses: pending → preparing → ready → (payment) → completed
              </div>
            </div>
          ) : (
            analytics.sales.map((sale) => (
              <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{sale.orderNumber}</span>
                      <span className="text-sm text-gray-500">• Table {sale.tableNumber}</span>
                      {getStatusBadge(sale.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{sale.customer?.name || 'Unknown'}</span>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-sm text-gray-500">{formatTime(sale.updatedAt || sale.createdAt)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {sale.items?.slice(0, 3).map((item, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item.quantity}x {item.displayName || item.name}
                        </span>
                      ))}
                      {sale.items?.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{sale.items.length - 3} more
                        </span>
                      )}
                    </div>

                    {sale.specialInstructions && (
                      <p className="text-xs text-blue-600 mt-1">
                        Note: {sale.specialInstructions}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-600">₹{sale.totalPrice}</p>
                    <p className="text-xs text-gray-500">{sale.totalItems} items</p>
                    <div className="text-xs text-green-600 mt-1 flex items-center justify-end gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Paid
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      {analytics.sales.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {analytics.sales.length} sale{analytics.sales.length !== 1 ? 's' : ''} for {selectedPeriod}
        </div>
      )}
    </div>
  );
};

export default SalesTab;