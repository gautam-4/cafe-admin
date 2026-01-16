import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, ChevronDown } from 'lucide-react';

const CategoryPerformanceChart = ({ analytics, selectedChartType, onChartTypeChange }) => {
  const chartTypes = [
    { key: 'category', label: 'Category Performance' },
    { key: 'vegNonVeg', label: 'Veg vs Non-Veg' },
    { key: 'priceRange', label: 'Order Count by Price Range' }
  ];

  // Function to get pie chart data based on selected type
  const getPieChartData = () => {
    switch (selectedChartType) {
      case 'category':
        // Merge categories with same name (case-insensitive)
        const mergedCategories = {};
        Object.entries(analytics.categoryBreakdown).forEach(([category, revenue]) => {
          const normalizedName = category.toLowerCase();
          const displayName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
          mergedCategories[displayName] = (mergedCategories[displayName] || 0) + revenue;
        });
        
        return Object.entries(mergedCategories)
          .map(([category, revenue]) => ({
            name: category,
            value: revenue,
            percentage: analytics.totalRevenue > 0 ? ((revenue / analytics.totalRevenue) * 100).toFixed(1) : 0
          }))
          .sort((a, b) => b.value - a.value);

      case 'vegNonVeg':
        const vegNonVegBreakdown = { veg: 0, nonVeg: 0, unknown: 0 };
        analytics.sales.forEach(sale => {
          if (sale.items && sale.items.length > 0) {
            sale.items.forEach(item => {
              const itemTotal = item.itemTotal || 0;
              if (item.isVeg === true) {
                vegNonVegBreakdown.veg += itemTotal;
              } else if (item.isVeg === false) {
                vegNonVegBreakdown.nonVeg += itemTotal;
              } else {
                vegNonVegBreakdown.unknown += itemTotal;
              }
            });
          }
        });

        return Object.entries(vegNonVegBreakdown)
          .filter(([, value]) => value > 0)
          .map(([type, revenue]) => ({
            name: type === 'nonVeg' ? 'Non-Veg' : type.charAt(0).toUpperCase() + type.slice(1),
            value: revenue,
            percentage: analytics.totalRevenue > 0 ? ((revenue / analytics.totalRevenue) * 100).toFixed(1) : 0
          }))
          .sort((a, b) => b.value - a.value);

      case 'priceRange':
        const priceRanges = {
          'Under ₹100': 0,
          '₹100-₹300': 0,
          '₹300-₹500': 0,
          '₹500-₹1000': 0,
          'Above ₹1000': 0
        };

        analytics.sales.forEach(sale => {
          const price = sale.totalPrice || 0;
          if (price < 100) {
            priceRanges['Under ₹100'] += 1;
          } else if (price < 300) {
            priceRanges['₹100-₹300'] += 1;
          } else if (price < 500) {
            priceRanges['₹300-₹500'] += 1;
          } else if (price < 1000) {
            priceRanges['₹500-₹1000'] += 1;
          } else {
            priceRanges['Above ₹1000'] += 1;
          }
        });

        return Object.entries(priceRanges)
          .filter(([, count]) => count > 0)
          .map(([range, orderCount]) => ({
            name: range,
            value: orderCount,
            percentage: analytics.totalOrders > 0 ? ((orderCount / analytics.totalOrders) * 100).toFixed(1) : 0
          }))
          .sort((a, b) => b.value - a.value);

      default:
        return [];
    }
  };

  const pieChartData = getPieChartData();

  // Colors for pie chart
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
    '#EC4899', '#6B7280'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.payload.name}</p>
          {selectedChartType === 'priceRange' ? (
            <>
              <p className="text-blue-600">{data.value} orders</p>
              <p className="text-sm text-gray-600">{data.payload.percentage}% of total orders</p>
            </>
          ) : (
            <>
              <p className="text-green-600">₹{data.value.toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600">{data.payload.percentage}% of total</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  if (pieChartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <PieChartIcon className="w-5 h-5" />
          Sales Distribution
        </h3>
        
        {/* Chart Type Dropdown */}
        <div className="relative">
          <select
            value={selectedChartType}
            onChange={(e) => onChartTypeChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            {chartTypes.map((type) => (
              <option key={type.key} value={type.key}>
                {type.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Data List */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 mb-3">
            {chartTypes.find(type => type.key === selectedChartType)?.label}
          </h4>
          {pieChartData.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              <div className="text-right">
                {selectedChartType === 'priceRange' ? (
                  <>
                    <span className="text-lg font-bold text-blue-600">
                      {item.value} orders
                    </span>
                    <p className="text-xs text-gray-600">{item.percentage}% of orders</p>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold text-green-600">
                      ₹{Math.round(item.value).toLocaleString('en-IN')}
                    </span>
                    <p className="text-xs text-gray-600">{item.percentage}%</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPerformanceChart;