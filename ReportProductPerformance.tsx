import React, { useMemo, useState } from 'react';
import type { SalesOrder, Product, Currency, FinancialPeriod } from './types';
import { PrinterIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';

interface ReportProductPerformanceProps {
  salesOrders: SalesOrder[];
  products: Product[];
  currency: Currency;
  financialPeriods: FinancialPeriod[];
}

const ReportProductPerformance: React.FC<ReportProductPerformanceProps> = ({ salesOrders, products, currency, financialPeriods }) => {
  const [comparisonPeriodId, setComparisonPeriodId] = useState<number | ''>('');

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);
  
  const currentPeriod = financialPeriods.find(p => p.status === 'مفتوحة');

  const calculatePerformance = (period: FinancialPeriod) => {
    const periodOrders = salesOrders.filter(o => new Date(o.orderDate) >= new Date(period.startDate) && new Date(o.orderDate) <= new Date(period.endDate));
    const performanceMap = new Map<number, { name: string, quantity: number, revenue: number }>();
    
    products.forEach(p => performanceMap.set(p.id, { name: p.name, quantity: 0, revenue: 0 }));
    
    periodOrders.forEach(order => {
        order.items.forEach(item => {
            if (performanceMap.has(item.productId)) {
                const current = performanceMap.get(item.productId)!;
                current.quantity += item.quantity;
                current.revenue += item.quantity * item.price;
            }
        });
    });

    return Array.from(performanceMap.values());
  };

  const currentPerformance = useMemo(() => currentPeriod ? calculatePerformance(currentPeriod) : [], [salesOrders, products, currentPeriod]);
  
  const comparisonPerformanceData = useMemo(() => {
    if (!comparisonPeriodId) return null;
    const period = financialPeriods.find(p => p.id === comparisonPeriodId);
    return period ? calculatePerformance(period) : null;
  }, [comparisonPeriodId, financialPeriods, salesOrders, products]);
  
  const combinedPerformance = useMemo(() => {
    return currentPerformance.map(currentItem => {
        const prevItem = comparisonPerformanceData?.find(p => p.name === currentItem.name);
        return {
            name: currentItem.name,
            currentQty: currentItem.quantity,
            prevQty: prevItem?.quantity,
            currentRevenue: currentItem.revenue,
            prevRevenue: prevItem?.revenue,
        };
    });
  }, [currentPerformance, comparisonPerformanceData]);

  const topByQuantity = [...combinedPerformance].sort((a,b) => b.currentQty - a.currentQty).slice(0, 10);
  const topByRevenue = [...combinedPerformance].sort((a,b) => b.currentRevenue - a.currentRevenue).slice(0, 10);

  const formatPercentage = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? <span className="text-green-500">(جديد)</span> : <span />;
      const change = ((current - previous) / previous) * 100;
      const color = change >= 0 ? 'text-green-500' : 'text-red-500';
      const icon = change >= 0 ? <TrendingUpIcon className="w-3 h-3" /> : <TrendingDownIcon className="w-3 h-3" />;
      return <span className={`flex items-center gap-1 text-xs ${color}`}>{icon} {change.toFixed(0)}%</span>;
  };

  
  const PerformanceTable: React.FC<{ title: string; data: typeof combinedPerformance, sortBy: 'qty' | 'revenue' }> = ({ title, data, sortBy }) => (
    <div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-4 py-2">المنتج</th>
                    <th className="px-4 py-2">الكمية المباعة</th>
                    <th className="px-4 py-2">الإيرادات</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.name} className="border-b dark:border-gray-700">
                        <td className="px-4 py-2 font-medium">{item.name}</td>
                        <td className={`px-4 py-2 ${sortBy === 'qty' ? 'font-bold' : ''}`}>
                            {item.currentQty}
                            {item.prevQty !== undefined && formatPercentage(item.currentQty, item.prevQty)}
                        </td>
                        <td className={`px-4 py-2 ${sortBy === 'revenue' ? 'font-bold' : ''}`}>
                            {formatCurrency(item.currentRevenue)}
                            {item.prevRevenue !== undefined && formatPercentage(item.currentRevenue, item.prevRevenue)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  return (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b pb-4 border-[var(--border-light)] dark:border-[var(--border-dark)]">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تقرير أداء المنتجات</h2>
                <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">المنتجات الأكثر مبيعاً في النظام.</p>
            </div>
             <div className="flex items-center gap-4 mt-4 md:mt-0 no-print">
                <div className="w-48">
                    <label htmlFor="comparison" className="text-xs">مقارنة مع:</label>
                    <select id="comparison" value={comparisonPeriodId} onChange={e => setComparisonPeriodId(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md">
                        <option value="">لا يوجد</option>
                        {financialPeriods.filter(p=>p.status === 'مغلقة').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
                    <PrinterIcon /> طباعة
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <PerformanceTable title="الأفضل مبيعاً حسب الكمية" data={topByQuantity} sortBy="qty" />
            <PerformanceTable title="الأفضل مبيعاً حسب الإيرادات" data={topByRevenue} sortBy="revenue" />
        </div>
    </div>
  );
};

export default ReportProductPerformance;