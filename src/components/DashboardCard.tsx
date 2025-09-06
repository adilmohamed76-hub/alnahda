import React from 'react';
// FIX: Update import path for types
import type { Currency } from '../types/index';

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  trendColor: string;
  currency?: Currency;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend, trendColor, currency }) => {
  const formatValue = () => {
    if (currency) {
      const convertedValue = value * currency.rate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedValue);
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] uppercase tracking-wider">{title}</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatValue()}</p>
          <p className={`mt-2 text-sm font-semibold ${trendColor}`}>
            {trend}
          </p>
        </div>
        <div className="bg-blue-500/10 text-[var(--primary-color)] rounded-full p-3">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
