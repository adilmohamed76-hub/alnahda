import React, { useMemo, useState } from 'react';
import type { SalesOrder, Customer, Currency, FinancialPeriod } from './types';
import { PrinterIcon, DollarSignIcon, UsersIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';

interface ReportSalesSummaryProps {
  salesOrders: SalesOrder[];
  customers: Customer[];
  currency: Currency;
  financialPeriods: FinancialPeriod[];
}

const ReportSalesSummary: React.FC<ReportSalesSummaryProps> = ({ salesOrders, customers, currency, financialPeriods }) => {
  const [comparisonPeriodId, setComparisonPeriodId] = useState<number | ''>('');
    
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);
  const formatPercentage = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? <span className="text-green-500"> (جديد)</span> : '';
      const change = ((current - previous) / previous) * 100;
      const color = change >= 0 ? 'text-green-500' : 'text-red-500';
      const icon = change >= 0 ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />;
      return <span className={`flex items-center gap-1 text-xs ${color}`}>{icon} {change.toFixed(1)}%</span>;
  };
  
  const currentPeriod = financialPeriods.find(p => p.status === 'مفتوحة');

  const calculateSummary = (period: FinancialPeriod) => {
    if (period.status === 'مغلقة' && period.snapshotData) {
        return { totalRevenue: period.snapshotData.totalSales, totalInvoices: 0, avgInvoiceValue: 0, salesByCustomer: [] };
    }
    const periodOrders = salesOrders.filter(o => new Date(o.orderDate) >= new Date(period.startDate) && new Date(o.orderDate) <= new Date(period.endDate));
    const totalRevenue = periodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalInvoices = periodOrders.length;
    const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    return { totalRevenue, totalInvoices, avgInvoiceValue };
  };
  
  const currentSummary = useMemo(() => currentPeriod ? calculateSummary(currentPeriod) : { totalRevenue: 0, totalInvoices: 0, avgInvoiceValue: 0 }, [salesOrders, currentPeriod]);
  const comparisonSummary = useMemo(() => {
    if (!comparisonPeriodId) return null;
    const period = financialPeriods.find(p => p.id === comparisonPeriodId);
    return period ? calculateSummary(period) : null;
  }, [comparisonPeriodId, financialPeriods]);


  const KpiCard: React.FC<{title: string, current: number, previous: number | null, isCurrency: boolean}> = ({title, current, previous, isCurrency}) => (
     <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center">
        <h3 className="text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{title}</h3>
        <p className="text-2xl font-bold">{isCurrency ? formatCurrency(current) : current}</p>
        {previous !== null && <div className="flex justify-center mt-1">{formatPercentage(current, previous)}</div>}
    </div>
  );
  
  return (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b pb-4 border-[var(--border-light)] dark:border-[var(--border-dark)]">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تقرير ملخص المبيعات</h2>
                <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">نظرة عامة على أداء المبيعات.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <KpiCard title="إجمالي الإيرادات" current={currentSummary.totalRevenue} previous={comparisonSummary?.totalRevenue ?? null} isCurrency={true}/>
            <KpiCard title="عدد الفواتير" current={currentSummary.totalInvoices} previous={comparisonSummary?.totalInvoices ?? null} isCurrency={false}/>
            <KpiCard title="متوسط قيمة الفاتورة" current={currentSummary.avgInvoiceValue} previous={comparisonSummary?.avgInvoiceValue ?? null} isCurrency={true}/>
        </div>
    </div>
  );
};

export default ReportSalesSummary;