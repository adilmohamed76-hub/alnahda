import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SalesOrder, Product, ProductCategory } from './types';

interface SalesByCategoryChartProps {
  salesOrders: SalesOrder[];
  products: Product[];
  categories: ProductCategory[];
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9', '#64748b'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-3 border border-[var(--border-light)] dark:border-[var(--border-dark)] rounded-lg shadow-lg">
        <p className="label font-semibold text-gray-800 dark:text-gray-200">{`${payload[0].name} : ${payload[0].value.toFixed(0)}%`}</p>
      </div>
    );
  }
  return null;
};

const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({ salesOrders, products, categories }) => {
  const chartData = useMemo(() => {
    const categorySales = new Map<number, number>();

    salesOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const revenue = item.quantity * item.price;
          const currentTotal = categorySales.get(product.categoryId) || 0;
          categorySales.set(product.categoryId, currentTotal + revenue);
        }
      });
    });
    
    const totalRevenue = Array.from(categorySales.values()).reduce((sum, value) => sum + value, 0);
    if (totalRevenue === 0) return [];

    return Array.from(categorySales.entries()).map(([categoryId, revenue]) => ({
      name: categories.find(c => c.id === categoryId)?.name || 'غير مصنف',
      value: (revenue / totalRevenue) * 100, // as percentage
    }));
  }, [salesOrders, products, categories]);

  if (chartData.length === 0) {
    return <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><h2 className="text-xl font-semibold mb-2">المبيعات حسب التصنيف</h2><p>لا توجد بيانات مبيعات كافية لعرض الرسم البياني.</p></div>;
  }
  
  const chartTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-dark');

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">المبيعات حسب التصنيف</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: '12px', direction: 'rtl'}} formatter={(value) => <span className="text-gray-600 dark:text-gray-400">{value}</span>}/>
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

export default SalesByCategoryChart;
