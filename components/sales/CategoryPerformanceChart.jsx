import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const CategoryPerformanceChart = ({ analytics }) => {
    // Prepare data for pie chart
    const pieChartData = Object.entries(analytics.categoryBreakdown)
        .map(([category, revenue]) => ({
            name: category.charAt(0).toUpperCase() + category.slice(1),
            value: revenue,
            percentage: analytics.totalRevenue > 0 ? ((revenue / analytics.totalRevenue) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.value - a.value);

    // Colors for pie chart
    const COLORS = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
        '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
        '#EC4899', '#6B7280'
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{data.payload.name}</p>
                    <p className="text-green-600">₹{data.value.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-600">{data.payload.percentage}% of total</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                Category Performance
            </h3>

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

                {/* Category List */}
                <CategoryList categories={pieChartData} colors={COLORS} />
            </div>
        </div>
    );
};