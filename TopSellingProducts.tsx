import React, { useMemo } from 'react';
import type { SalesOrder, Product, Currency } from './types';
import { TrendingUpIcon } from './Icons';

interface TopSellingProductsProps {
  salesOrders: SalesOrder[];
  products: Product[];
  currency: Currency;
}

const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ salesOrders, products, currency }) => {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(value * currency.rate);

  const topProducts = useMemo(() => {
    const productSales = new Map<number, { name: string; revenue: number }>();

    salesOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const currentSales = productSales.get(item.productId) || { name: product.name, revenue: 0 };
          currentSales.revenue += item.quantity * item.price;
          productSales.set(item.productId, currentSales);
        }
      });
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [salesOrders, products]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">أفضل 5 منتجات مبيعاً</h2>
      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
              index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
            </div>
            <div className="font-bold text-green-500 text-sm">
              {formatCurrency(product.revenue)}
            </div>
          </div>
        ))}
        {topProducts.length === 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد بيانات مبيعات لعرضها.</p>
        )}
      </div>
    </div>
  );
};

export default TopSellingProducts;
