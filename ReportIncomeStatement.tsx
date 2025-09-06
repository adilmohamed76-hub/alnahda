import React, { useMemo, useState } from 'react';
import type { SalesOrder, PurchaseOrder, Currency, FinancialPeriod } from './types';
import { PrinterIcon } from './Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportIncomeStatementProps {
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  currency: Currency;
  financialPeriods: FinancialPeriod[];
}

const ReportIncomeStatement: React.FC<ReportIncomeStatementProps> = ({ salesOrders, purchaseOrders, currency, financialPeriods }) => {
  const openPeriod = financialPeriods.find(p => p.status === 'مفتوحة');
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>(openPeriod?.id || '');

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);

  const { chartData, kpis } = useMemo(() => {
    if (!selectedPeriodId) return { chartData: [], kpis: { revenue: 0, expenses: 0, profit: 0 } };
    
    const period = financialPeriods.find(p => p.id === selectedPeriodId)!;
    
    // Use snapshot data if available for closed periods
    if (period.status === 'مغلقة' && period.snapshotData) {
        const { totalSales, totalPurchases, grossProfit } = period.snapshotData;
        const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const startDate = new Date(period.startDate);
        const endDate = new Date(period.endDate);
        let months = [];
        let currentDate = startDate;
        while(currentDate <= endDate) {
            months.push(monthNames[currentDate.getMonth()]);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        const simulatedChartData = months.map((month) => ({
            name: month,
            الإيرادات: totalSales / months.length,
            المصروفات: totalPurchases / months.length,
        }));

        return {
            chartData: simulatedChartData,
            kpis: { revenue: totalSales, expenses: totalPurchases, profit: grossProfit }
        };
    }

    // Calculate from live data for open periods
    const periodOrders = salesOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= new Date(period.startDate) && orderDate <= new Date(period.endDate);
    });
    const periodPurchases = purchaseOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= new Date(period.startDate) && orderDate <= new Date(period.endDate) && o.status === 'تم الاستلام';
    });

    const totalRevenue = periodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalExpenses = periodPurchases.reduce((sum, order) => sum + order.totalAmount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const salesByMonth: { [key: string]: number } = {};
    const expensesByMonth: { [key: string]: number } = {};
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    periodOrders.forEach(order => {
      const month = new Date(order.orderDate).getMonth();
      const monthName = monthNames[month];
      salesByMonth[monthName] = (salesByMonth[monthName] || 0) + order.totalAmount;
    });

    periodPurchases.forEach(order => {
        const month = new Date(order.orderDate).getMonth();
        const monthName = monthNames[month];
        expensesByMonth[monthName] = (expensesByMonth[monthName] || 0) + order.totalAmount;
    });

    const allMonths = new Set([...Object.keys(salesByMonth), ...Object.keys(expensesByMonth)]);
    const sortedMonths = Array.from(allMonths).sort((a,b) => monthNames.indexOf(a) - monthNames.indexOf(b));

    const finalChartData = sortedMonths.map(month => ({
        name: month,
        الإيرادات: salesByMonth[month] || 0,
        المصروفات: expensesByMonth[month] || 0,
    }));

    return {
        chartData: finalChartData,
        kpis: { revenue: totalRevenue, expenses: totalExpenses, profit: netProfit }
    };

  }, [selectedPeriodId, financialPeriods, salesOrders, purchaseOrders]);
  
  const chartTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-dark');


  return (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b pb-4 border-[var(--border-light)] dark:border-[var(--border-dark)]">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تقرير الدخل</h2>
                <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">تحليل الإيرادات والمصروفات وصافي الربح لفترة محددة.</p>
            </div>
             <div className="flex items-center gap-4 mt-4 md:mt-0 no-print">
                <div className="w-48">
                    <label htmlFor="period" className="text-xs">الفترة المالية:</label>
                    <select id="period" value={selectedPeriodId} onChange={e => setSelectedPeriodId(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md">
                        {financialPeriods.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
                    <PrinterIcon /> طباعة
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">إجمالي الإيرادات</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(kpis.revenue)}</p>
            </div>
             <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">إجمالي المصروفات</h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(kpis.expenses)}</p>
            </div>
             <div className={`p-4 rounded-lg text-center ${kpis.profit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                <h3 className={`text-sm font-medium ${kpis.profit >= 0 ? 'text-blue-800 dark:text-blue-300' : 'text-orange-800 dark:text-orange-300'}`}>صافي الربح</h3>
                <p className={`text-2xl font-bold ${kpis.profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>{formatCurrency(kpis.profit)}</p>
            </div>
        </div>
        
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                    <XAxis dataKey="name" tick={{ fill: chartTextColor }} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: chartTextColor }} />
                    <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                            backgroundColor: 'var(--card-light)',
                            borderColor: 'var(--border-light)',
                            direction: 'rtl'
                        }}
                    />
                    <Legend wrapperStyle={{ direction: 'rtl' }} formatter={(value) => <span className="text-gray-600 dark:text-gray-400">{value}</span>}/>
                    <Line type="monotone" dataKey="الإيرادات" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="المصروفات" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default ReportIncomeStatement;
