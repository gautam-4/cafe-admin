import { IndianRupee } from 'lucide-react';

const SaleItemsList = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">
              {item.quantity}x {item.displayName || item.name}
            </span>
            {item.category && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {item.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
            <IndianRupee className="w-3 h-3" />
            {item.itemTotal?.toLocaleString('en-IN')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SaleItemsList;