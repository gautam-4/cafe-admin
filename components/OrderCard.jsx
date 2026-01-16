'use client';

import { useState } from 'react';
import { Clock, User, Phone, ChefHat, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const OrderCard = ({ order, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prepared': return 'bg-green-100 text-green-800 border-green-200';
      case 'paid': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'pending': return 'border-yellow-500';
      case 'preparing': return 'border-blue-500';
      case 'prepared': return 'border-green-500';
      case 'paid': return 'border-purple-500';
      case 'cancelled': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'HH:mm');
    } catch (error) {
      return 'N/A';
    }
  };

  const getTimeElapsed = () => {
    if (!order.createdAt) return '';
    try {
      const orderTime = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const now = new Date();
      const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
      return `${diffMinutes}m ago`;
    } catch (error) {
      return '';
    }
  };

  const isOverdue = () => {
    if (!order.createdAt || !order.estimatedTime) return false;
    try {
      const orderTime = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const now = new Date();
      const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
      return diffMinutes > order.estimatedTime && order.status !== 'prepared' && order.status !== 'paid';
    } catch (error) {
      return false;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${getStatusBorderColor(order.status)} ${isOverdue() ? 'ring-2 ring-red-200' : ''}`}>
      {/* Overdue Warning */}
      {isOverdue() && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700 font-medium">Order is overdue!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{order.orderNumber}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Table {order.tableNumber}</span>
            <span>•</span>
            <span>{getTimeElapsed()}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {order.status.toUpperCase()}
          </span>
          {/* <p className="text-lg font-bold text-gray-900 mt-1">₹{order.totalPrice}</p> */}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">{order.customer.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">{order.customer.phone}</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <ChefHat className="w-4 h-4" />
          Items ({order.totalItems})
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 rounded p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900">
                    {item.name}
                  </p>
                  {item.isVeg !== undefined && (
                    <span className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  )}
                </div>
                {item.customization && (
                  <p className="text-xs text-blue-600 font-medium">
                    {item.customization.label}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-md text-gray-600">×{item.quantity}</p>
                {/* <p className="text-sm text-gray-600">₹{item.itemTotal}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="mb-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <p className="text-sm text-gray-700">
            <strong className="text-yellow-800">Special Instructions:</strong> {order.specialInstructions}
          </p>
        </div>
      )}

      {/* Timing Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600 bg-gray-50 rounded p-2">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Ordered: {formatTime(order.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>ETA: {order.estimatedTime} mins</span>
        </div>
      </div>

      {/* Action Buttons */}
      {order.status !== 'paid' && order.status !== 'cancelled' && (
        <div className="flex gap-2 flex-wrap">
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange('preparing')}
                disabled={updating}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Start Preparing'}
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={updating}
                className="px-4 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {order.status === 'preparing' && (
            <>
              <button
                onClick={() => handleStatusChange('prepared')}
                disabled={updating}
                className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Mark as Prepared'}
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={updating}
                className="px-4 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </>


          )}

          {order.status === 'prepared' && (
            <>
              <button
                onClick={() => handleStatusChange('paid')}
                disabled={updating}
                className="flex-1 bg-purple-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Processing...' : 'Mark as Paid'}
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={updating}
                className="px-4 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;