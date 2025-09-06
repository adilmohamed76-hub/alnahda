import React, { useMemo, useState } from 'react';
import type { Product, Currency, FinancialPeriod } from './types';
import { PrinterIcon, ArchiveIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';

interface ReportInventoryValuationProps {
  products: Product[];
  currency: Currency;
  financialPeriods: FinancialPeriod[];
}

const ReportInventoryValuation: React.FC<ReportInventoryValuationProps> = ({ products, currency, financialPeriods }) => {
  const [comparisonPeriodId, setComparisonPeriodId] = useState<number | ''>('');
    
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);
  const formatPercentage = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? <span className="text-green-500"> (جديد)</span> : '';
      const change = ((current - previous) / previous) * 100;
      const color = change >= 0 ? 'text-green-500' : 'text-red-500';
      const icon = change >= 0 ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />;
      return <span className={`flex items-center gap-1 text-xs ${color}`}>{icon} {change.toFixed(1)}%</span>;
  };

  const inventoryData = useMemo(() => {
    return products.map(product => {
      const totalStock = product.stockLocations.reduce((sum, loc) => sum + loc.quantity, 0);
      const totalValue = totalStock * product.costPrice;
      return { ...product, totalStock, totalValue };
    });
  }, [products]);

  const grandTotalValue = useMemo(() => inventoryData.reduce((sum, p) => sum + p.totalValue, 0), [inventoryData]);
  
  const comparisonPeriodData = useMemo(() => {
    if (!comparisonPeriodId) return null;
    const period = financialPeriods.find(p => p.id === comparisonPeriodId);
    return period?.snapshotData || null;
  }, [comparisonPeriodId, financialPeriods]);
  
  return (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b pb-4 border-[var(--border-light)] dark:border-[var(--border-dark)]">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تقرير تقييم المخزون</h2>
                <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">القيمة الإجمالية للمخزون بناءً على سعر التكلفة.</p>
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
        
         <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center mb-8">
            <ArchiveIcon className="w-8 h-8 mx-auto text-[var(--primary-color)] mb-2" />
            <h3 className="text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">القيمة الإجمالية للمخزون</h3>
            <p className="text-3xl font-bold">{formatCurrency(grandTotalValue)}</p>
            {comparisonPeriodData && <div className="flex justify-center mt-1">{formatPercentage(grandTotalValue, comparisonPeriodData.inventoryValue)}</div>}
        </div>


        <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3">المنتج</th>
                        <th className="px-6 py-3 text-center">إجمالي الكمية</th>
                        <th className="px-6 py-3">تكلفة الوحدة</th>
                        <th className="px-6 py-3">القيمة الإجمالية</th>
                    </tr>
                </thead>
                <tbody>
                    {inventoryData.map(product => (
                        <tr key={product.id} className="border-b dark:border-gray-700">
                            <td className="px-6 py-4 font-medium">{product.name}</td>
                            <td className="px-6 py-4 text-center font-mono">{product.totalStock}</td>
                            <td className="px-6 py-4">{formatCurrency(product.costPrice)}</td>
                            <td className="px-6 py-4 font-semibold">{formatCurrency(product.totalValue)}</td>
                        </tr>
                    ))}
                </tbody>
                 <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold text-base">
                    <tr>
                        <td colSpan={3} className="px-6 py-3 text-left">الإجمالي الكلي</td>
                        <td className="px-6 py-3">{formatCurrency(grandTotalValue)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
  );
};

export default ReportInventoryValuation;