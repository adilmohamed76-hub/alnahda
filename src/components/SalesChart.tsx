import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// FIX: Update import path for types
import type { SalesData, Currency } from '../types/index';

const data: SalesData[] = [
  { month: 'يناير', sales: 4000 },
  { month: 'فبراير', sales: 3000 },
  { month: 'مارس', sales: 5000 },
  { month: 'أبريل', sales: 4500 },
  { month: 'مايو', sales: 6000 },
  { month: 'يونيو', sales: 5500 },
  { month: 'يوليو', sales: 7000 },
  { month: 'أغسطس', sales: 6500 },
];

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    
    return (
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-3 border border-[var(--border-light)] dark:border-[var(--border-dark)] rounded-lg shadow-lg">
        <p className="label font-semibold text-gray-800 dark:text-gray-200">{`${label}`}</p>
        <p className="intro text-[var(--primary-color)]">{`المبيعات : ${formattedValue}`}</p>
      </div>
    );
  }
  return null;
};

interface SalesChartProps {
  currency: Currency;
}

const SalesChart: React.FC<SalesChartProps> = ({ currency }) => {
  const convertedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      sales: item.sales * currency.rate,
    }));
  }, [currency]);

  const tickFormatter = (value: number) => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }
    return value.toString();
  };

  const chartTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-dark');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={convertedData}
        margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
        <XAxis dataKey="month" tick={{ fill: chartTextColor }} stroke="rgba(128, 128, 128, 0.3)" />
        <YAxis orientation="right" tickFormatter={tickFormatter} tick={{ fill: chartTextColor }} stroke="rgba(128, 128, 128, 0.3)" />
        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(128, 128, 128, 0.05)' }}/>
        <Legend wrapperStyle={{ direction: 'rtl' }} formatter={(value) => <span className="text-gray-600 dark:text-gray-400">{value}</span>}/>
        <Bar dataKey="sales" name="المبيعات" fill="var(--primary-color)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
