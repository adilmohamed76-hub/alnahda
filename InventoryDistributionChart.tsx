import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Product, Warehouse } from './types';

interface InventoryDistributionChartProps {
  products: Product[];
  warehouses: Warehouse[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-3 border border-[var(--border-light)] dark:border-[var(--border-dark)] rounded-lg shadow-lg">
        <p className="label font-semibold text-gray-800 dark:text-gray-200">{`${label}`}</p>
        <p className="intro text-[var(--primary-color)]">{`الكمية : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const InventoryDistributionChart: React.FC<InventoryDistributionChartProps> = ({ products, warehouses }) => {
  const chartData = useMemo(() => {
    const warehouseStock = new Map<number, number>();
    warehouses.forEach(w => warehouseStock.set(w.id, 0));

    products.forEach(product => {
      product.stockLocations.forEach(loc => {
        const currentStock = warehouseStock.get(loc.warehouseId) || 0;
        warehouseStock.set(loc.warehouseId, currentStock + loc.quantity);
      });
    });

    return Array.from(warehouseStock.entries()).map(([warehouseId, quantity]) => ({
      name: warehouses.find(w => w.id === warehouseId)?.name || `مخزن ${warehouseId}`,
      quantity,
    }));
  }, [products, warehouses]);
  
  const chartTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-dark');

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">توزيع المخزون</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 25 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
          <XAxis type="number" tick={{ fill: chartTextColor }} stroke="rgba(128, 128, 128, 0.3)" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: chartTextColor, fontSize: 12 }}
            stroke="rgba(128, 128, 128, 0.3)"
            width={80}
            interval={0}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.05)' }} />
          <Bar dataKey="quantity" name="الكمية" fill="var(--primary-color)" radius={[0, 6, 6, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default InventoryDistributionChart;
