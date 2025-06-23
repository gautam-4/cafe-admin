const CategoryList = ({ categories, colors }) => {
  return (
    <div className="space-y-3">
      {categories.map((category, index) => (
        <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="font-medium text-gray-900">{category.name}</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-green-600">
              ₹{Math.round(category.value).toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-gray-600">{category.percentage}%</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryPerformanceChart;
