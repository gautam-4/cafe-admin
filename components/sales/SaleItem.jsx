import { User, Clock, Phone, IndianRupee } from 'lucide-react';
import StatusBadge from './StatusBadge';
import SaleItemsList from './SaleItemsList';

const SaleItem = ({ sale }) => {
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

  return (
    <div className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{sale.orderNumber}</span>
            <span className="text-sm text-gray-500">• Table {sale.tableNumber}</span>
            <StatusBadge status={sale.status} />
          </div>
          <div className="text-right sm:text-right">
            <p className="text-lg sm:text-xl font-bold text-green-600">₹{sale.totalPrice.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500">{sale.totalItems} items</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{sale.customer?.name || 'Unknown'}</span>
          </div>
          {sale.customer?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{sale.customer.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{formatTime(sale.updatedAt || sale.createdAt)}</span>
          </div>
        </div>

        {/* Items with Prices */}
        <SaleItemsList items={sale.items} />

        {/* Special Instructions */}
        {sale.specialInstructions && (
          <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> {sale.specialInstructions}
            </p>
          </div>
        )}

        {/* Payment Status */}
        <div className="flex justify-end">
          <div className="flex items-center gap-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Paid
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleItem;