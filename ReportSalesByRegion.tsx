import React, { useMemo } from 'react';
import type { SalesOrder, Customer, Currency } from './types';
import { PrinterIcon, MapIcon } from './Icons';

interface ReportSalesByRegionProps {
  salesOrders: SalesOrder[];
  customers: Customer[];
  currency: Currency;
}

const ReportSalesByRegion: React.FC<ReportSalesByRegionProps> = ({ salesOrders, customers, currency }) => {
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);

  const salesByRegion = useMemo(() => {
    const regionData = new Map<string, { totalSales: number, orderCount: number }>();
    
    salesOrders.forEach(order => {
      const customer = customers.find(c => c.id === order.customerId);
      const region = customer?.region || 'غير محدد';
      
      const currentData = regionData.get(region) || { totalSales: 0, orderCount: 0 };
      currentData.totalSales += order.totalAmount;
      currentData.orderCount += 1;
      regionData.set(region, currentData);
    });
    
    return Array.from(regionData.entries())
      .map(([region, data]) => ({ region, ...data }))
      .sort((a, b) => b.totalSales - a.totalSales);

  }, [salesOrders, customers]);

  return (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b pb-4 border-[var(--border-light)] dark:border-[var(--border-dark)]">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تقرير المبيعات حسب المنطقة</h2>
          <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">تحليل لتوزيع المبيعات في المناطق الجغرافية المختلفة.</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 no-print">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
            <PrinterIcon /> طباعة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-x-auto">
           <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">المنطقة</th>
                <th className="px-6 py-3">إجمالي المبيعات</th>
                <th className="px-6 py-3">عدد الطلبات</th>
                <th className="px-6 py-3">متوسط قيمة الطلب</th>
              </tr>
            </thead>
            <tbody>
              {salesByRegion.map(({ region, totalSales, orderCount }) => (
                <tr key={region} className="border-b dark:border-gray-700">
                  <td className="px-6 py-4 font-medium">{region}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(totalSales)}</td>
                  <td className="px-6 py-4 font-mono">{orderCount}</td>
                  <td className="px-6 py-4">{formatCurrency(orderCount > 0 ? totalSales / orderCount : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:col-span-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
            <MapIcon className="w-24 h-24 text-gray-400 dark:text-gray-600" />
            <p className="mt-4 text-center text-gray-500">
                تم تجميع بيانات المبيعات حسب المناطق. عرض الخريطة الحرارية غير متوفر حاليًا.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ReportSalesByRegion;
