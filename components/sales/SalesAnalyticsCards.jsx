import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const SalesAnalyticsCards = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs sm:text-sm">Total Revenue</p>
            <p className="text-xl sm:text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-green-200 text-xs mt-1">From paid orders</p>
          </div>
          <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs sm:text-sm">Completed Orders</p>
            <p className="text-xl sm:text-2xl font-bold">{analytics.totalOrders}</p>
            <p className="text-blue-200 text-xs mt-1">Paid orders only</p>
          </div>
          <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-xs sm:text-sm">Avg Order Value</p>
            <p className="text-xl sm:text-2xl font-bold">₹{Math.round(analytics.avgOrderValue)}</p>
            <p className="text-purple-200 text-xs mt-1">Per completed order</p>
          </div>
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsCards;