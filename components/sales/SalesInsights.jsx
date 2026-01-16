import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Clock, Calendar, DollarSign } from 'lucide-react';

const SalesInsights = ({ analytics, selectedPeriod }) => {
  // Prepare hourly distribution data
  const getHourlyDistribution = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i}:00`,
      revenue: 0,
      orders: 0
    }));

    analytics.sales.forEach(sale => {
      let saleDate;
      if (sale.updatedAt && sale.updatedAt.toDate) {
        saleDate = sale.updatedAt.toDate();
      } else if (sale.createdAt && sale.createdAt.toDate) {
        saleDate = sale.createdAt.toDate();
      } else {
        return;
      }

      const hour = saleDate.getHours();
      hourlyData[hour].revenue += sale.totalPrice || 0;
      hourlyData[hour].orders += 1;
    });

    return hourlyData.filter(h => h.orders > 0);
  };

  // Prepare day of week distribution data
  const getDayOfWeekDistribution = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = days.map((day, index) => ({
      day,
      dayIndex: index,
      revenue: 0,
      orders: 0
    }));

    analytics.sales.forEach(sale => {
      let saleDate;
      if (sale.updatedAt && sale.updatedAt.toDate) {
        saleDate = sale.updatedAt.toDate();
      } else if (sale.createdAt && sale.createdAt.toDate) {
        saleDate = sale.createdAt.toDate();
      } else {
        return;
      }

      const dayIndex = saleDate.getDay();
      dayData[dayIndex].revenue += sale.totalPrice || 0;
      dayData[dayIndex].orders += 1;
    });

    return dayData;
  };

  // Prepare monthly distribution data (for periods showing multiple months)
  const getMonthlyDistribution = () => {
    const monthlyMap = new Map();

    analytics.sales.forEach(sale => {
      let saleDate;
      if (sale.updatedAt && sale.updatedAt.toDate) {
        saleDate = sale.updatedAt.toDate();
      } else if (sale.createdAt && sale.createdAt.toDate) {
        saleDate = sale.createdAt.toDate();
      } else {
        return;
      }

      const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = saleDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          revenue: 0,
          orders: 0
        });
      }

      const data = monthlyMap.get(monthKey);
      data.revenue += sale.totalPrice || 0;
      data.orders += 1;
    });

    return Array.from(monthlyMap.values()).sort((a, b) => {
      const [aYear, aMonth] = a.month.split(' ');
      const [bYear, bMonth] = b.month.split(' ');
      return new Date(aYear, getMonthIndex(aMonth)) - new Date(bYear, getMonthIndex(bMonth));
    });
  };

  const getMonthIndex = (monthShort) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthShort);
  };

  // Get peak insights
  const getPeakInsights = () => {
    const hourlyData = getHourlyDistribution();
    const dayData = getDayOfWeekDistribution();

    const peakHour = hourlyData.reduce((max, h) => h.revenue > max.revenue ? h : max, hourlyData[0] || { hour: 0, revenue: 0 });
    const peakDay = dayData.reduce((max, d) => d.revenue > max.revenue ? d : max, dayData[0] || { day: 'N/A', revenue: 0 });

    return { peakHour, peakDay };
  };

  const hourlyData = getHourlyDistribution();
  const dayData = getDayOfWeekDistribution();
  const monthlyData = getMonthlyDistribution();
  const { peakHour, peakDay } = getPeakInsights();

  const shouldShowMonthly = ['year', 'all', 'custom'].includes(selectedPeriod) && monthlyData.length > 1;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-green-600">Revenue: ₹{payload[0]?.value?.toLocaleString('en-IN')}</p>
          <p className="text-blue-600">Orders: {payload[1]?.value || 0}</p>
        </div>
      );
    }
    return null;
  };

  if (analytics.sales.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mb-6 sm:mb-8">
      {/* Peak Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Peak Hour
              </p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">
                {peakHour.label || 'N/A'}
              </p>
              <p className="text-orange-200 text-xs mt-2">
                ₹{peakHour.revenue.toLocaleString('en-IN')} • {peakHour.orders} orders
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs sm:text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Peak Day
              </p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">
                {peakDay.day || 'N/A'}
              </p>
              <p className="text-indigo-200 text-xs mt-2">
                ₹{peakDay.revenue.toLocaleString('en-IN')} • {peakDay.orders} orders
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Monthly Sales Trend (for year/all/custom periods) */}
      {shouldShowMonthly && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Sales Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Revenue (₹)"
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Orders"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sales by Hour of Day */}
      {hourlyData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Sales by Hour of Day
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="Revenue (₹)" />
                <Bar yAxisId="right" dataKey="orders" fill="#3B82F6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sales by Day of Week */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Sales by Day of Week
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#8B5CF6" name="Revenue (₹)" />
              <Bar yAxisId="right" dataKey="orders" fill="#F59E0B" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesInsights;