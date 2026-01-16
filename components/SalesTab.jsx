'use client';

import { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { 
  RefreshCw,
  AlertCircle,
  CalendarRange
} from 'lucide-react';
import PeriodSelector from './sales/PeriodSelector';
import SalesAnalyticsCards from './sales/SalesAnalyticsCards';
import CategoryPerformanceChart from './sales/CategoryPerformanceChart';
import RecentSalesList from './sales/RecentSalesList';
import SalesInsights from './sales/SalesInsights';

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
      <PeriodSelector 
        selectedPeriod={selectedPeriod} 
        onPeriodChange={handlePeriodChange}
      />

      {/* Custom Date Range Selector */}
      {showCustomRange && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CalendarRange className="w-4 h-4" />
            Select Date Range
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            <strong>Selected Range:</strong> {getCustomRangeLabel()}
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <SalesAnalyticsCards analytics={analytics} />

      {/* Category Performance Chart */}
      <CategoryPerformanceChart 
        analytics={analytics} 
        selectedChartType={selectedChartType}
        onChartTypeChange={setSelectedChartType}
      />

      {/* Business Insights */}
      <SalesInsights analytics={analytics} selectedPeriod={selectedPeriod} />
      

      {/* Recent Sales */}
      <RecentSalesList analytics={analytics} selectedPeriod={selectedPeriod} />

      {/* Footer */}
      {analytics.sales.length > 0 && (
        <div className="mt-4 sm:mt-6 text-center text-sm text-gray-500">
          Showing {analytics.sales.length} sale{analytics.sales.length !== 1 ? 's' : ''} for {selectedPeriod === 'custom' ? getCustomRangeLabel() : selectedPeriod}
        </div>
      )}
    </div>
  );
};

export default SalesTab;