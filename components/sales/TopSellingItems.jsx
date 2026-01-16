import { Package } from 'lucide-react';

const rankColors = [
  'bg-yellow-100 text-yellow-700', // 1st
  'bg-gray-200 text-gray-700',     // 2nd
  'bg-orange-100 text-orange-700', // 3rd
];

const TopSellingItems = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-gray-600" />
        Top Selling Items
      </h3>

      <div className="space-y-3">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3 transition-all hover:bg-gray-100 hover:shadow-sm"
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              {/* Rank badge */}
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  rankColors[i] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {i + 1}
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.qty} sold
                </p>
              </div>
            </div>

            {/* Revenue */}
            <p className="font-semibold text-green-600">
              ₹{item.revenue.toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingItems;