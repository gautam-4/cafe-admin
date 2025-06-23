import { BarChart3, ShoppingCart } from 'lucide-react';
import SaleItem from './SaleItem';

const RecentSalesList = ({ analytics, selectedPeriod }) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Recent Sales ({selectedPeriod})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {analytics.sales.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900 mb-2">No sales yet</p>
            <p className="text-gray-600">Sales will appear here once orders are marked as paid.</p>
          </div>
        ) : (
          analytics.sales.map((sale) => (
            <SaleItem key={sale.id} sale={sale} />
          ))
        )}
      </div>
    </div>
  );
};

export default RecentSalesList;