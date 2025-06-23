import { Calendar } from 'lucide-react';

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year'}
  ];

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => onPeriodChange(period.key)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{period.label}</span>
            <span className="sm:hidden">{period.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodSelector;