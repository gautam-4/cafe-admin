'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useSales } from '../hooks/useSales';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  BarChart3,
  RefreshCw,
  AlertCircle,
  Calendar,
  PieChart as PieChartIcon,
  User,
  Clock,
  Phone,
  IndianRupee,
  ChevronDown,
  CalendarRange
} from 'lucide-react';

const SalesTab = () => {
  const { sales, loading, error, getSalesAnalytics, getAvailableYears } = useSales();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedChartType, setSelectedChartType] = useState('category');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customRange, setCustomRange] = useState({
    startMonth: new Date().getMonth(),
    startYear: new Date().getFullYear(),
    endMonth: new Date().getMonth(),
    endYear: new Date().getFullYear()
  });

  const analytics = getSalesAnalytics(
    selectedPeriod === 'custom' ? 'custom' : selectedPeriod,
    selectedPeriod === 'custom' ? customRange : null
  );

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year'},
    { key: 'custom', label: 'Custom Range' }
  ];

  const chartTypes = [
    { key: 'category', label: 'Category Performance' },
    { key: 'vegNonVeg', label: 'Veg vs Non-Veg' },
    { key: 'priceRange', label: 'Order Count by Price Range' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const availableYears = getAvailableYears();

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
    }
  };

  const handleCustomRangeChange = (field, value) => {
    setCustomRange(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  const getCustomRangeLabel = () => {
    const { startMonth, startYear, endMonth, endYear } = customRange;
    const startMonthName = months[startMonth];
    const endMonthName = months[endMonth];
    
    if (startYear === endYear && startMonth === endMonth) {
      return `${startMonthName} ${startYear}`;
    } else if (startYear === endYear) {
      return `${startMonthName} - ${endMonthName} ${startYear}`;
    } else {
      return `${startMonthName} ${startYear} - ${endMonthName} ${endYear}`;
    }
  };

  // Function to get pie chart data based on selected type
  const getPieChartData = () => {
    switch (selectedChartType) {
      case 'category':
        return Object.entries(analytics.categoryBreakdown)
          .map(([category, revenue]) => ({
            name: category.charAt(0).toUpperCase() + category.slice(1),
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
          } else {
            // If no item breakdown, distribute equally
            const pricePerType = sale.totalPrice / 3;
            vegNonVegBreakdown.unknown += pricePerType;
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
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
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
    <div className="p-3 sm:p-4 max-w-6xl mx-auto">
      {/* Period Selector */}
      <div className="mb-4 sm:mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => handlePeriodChange(period.key)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.key === 'custom' ? (
                <CalendarRange className="w-4 h-4 inline mr-1 sm:mr-2" />
              ) : (
                <Calendar className="w-4 h-4 inline mr-1 sm:mr-2" />
              )}
              <span className="hidden sm:inline">{period.label}</span>
              <span className="sm:hidden">{period.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Custom Date Range Selector */}
        {showCustomRange && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CalendarRange className="w-4 h-4" />
              Select Date Range
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">From</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={customRange.startMonth}
                    onChange={(e) => handleCustomRangeChange('startMonth', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-black focus:ring-blue-500 focus:border-blue-500"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={customRange.startYear}
                    onChange={(e) => handleCustomRangeChange('startYear', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-black focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">To</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={customRange.endMonth}
                    onChange={(e) => handleCustomRangeChange('endMonth', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-black focus:ring-blue-500 focus:border-blue-500"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={customRange.endYear}
                    onChange={(e) => handleCustomRangeChange('endYear', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-black focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Range Display */}
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              <strong>Selected Range:</strong> {getCustomRangeLabel()}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Cards */}
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

      {/* Pie Chart with Dropdown Selector */}
      {pieChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Sales Analytics
            </h3>
            
            {/* Chart Type Dropdown */}
            <div className="relative">
              <select
                value={selectedChartType}
                onChange={(e) => setSelectedChartType(e.target.value)}
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
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
      )}

      {/* Recent Sales */}
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
              <div key={sale.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{sale.orderNumber}</span>
                      <span className="text-sm text-gray-500">• Table {sale.tableNumber}</span>
                      {getStatusBadge(sale.status)}
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
                  <div className="space-y-2">
                    {sale.items?.map((item, index) => (
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
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      {analytics.sales.length > 0 && (
        <div className="mt-4 sm:mt-6 text-center text-sm text-gray-500">
          Showing {analytics.sales.length} sale{analytics.sales.length !== 1 ? 's' : ''} for {selectedPeriod}
        </div>
      )}
    </div>
  );
};

export default SalesTab;