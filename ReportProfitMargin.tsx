import React, { useMemo, useState } from 'react';
import type { SalesOrder, Product, ProductCategory, Currency, FinancialPeriod } from './types';
import { PrinterIcon, TrendingUpIcon, TrendingDownIcon, PercentageIcon } from './Icons';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportProfitMarginProps {
  salesOrders: SalesOrder[];
  products: Product[];
  categories: ProductCategory[];
  currency: Currency;
  financialPeriods: FinancialPeriod[];
}

const ReportProfitMargin: React.FC<ReportProfitMarginProps> = ({ salesOrders, products, categories, currency, financialPeriods }) => {
  const openPeriod = financialPeriods.find(p => p.status === 'مفتوحة');
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>(openPeriod?.id || '');

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const reportData = useMemo(() => {
    if (!selectedPeriodId) return {
      kpis: { overallMargin: 0, bestCategory: { name: '-', margin: 0 }, worstCategory: { name: '-', margin: 0 } },
      categoryMarginData: [],
      monthlyTrendData: []
    };
    
    const period = financialPeriods.find(p => p.id === selectedPeriodId)!;
    const periodOrders = salesOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= new Date(period.startDate) && orderDate <= new Date(period.endDate);
    });

    // Overall Calculation
    let totalRevenue = 0;
    let totalCost = 0;
    const categoryData: { [key: number]: { revenue: number, cost: number } } = {};
    const monthlyData: { [key: string]: { revenue: number, cost: number } } = {};
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];


    periodOrders.forEach(order => {
      const month = new Date(order.orderDate).getMonth();
      const monthName = monthNames[month];
      if (!monthlyData[monthName]) monthlyData[monthName] = { revenue: 0, cost: 0 };
      
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const revenue = item.price * item.quantity;
          const cost = product.costPrice * item.quantity;
          
          totalRevenue += revenue;
          totalCost += cost;

          if (!categoryData[product.categoryId]) categoryData[product.categoryId] = { revenue: 0, cost: 0 };
          categoryData[product.categoryId].revenue += revenue;
          categoryData[product.categoryId].cost += cost;
          
          monthlyData[monthName].revenue += revenue;
          monthlyData[monthName].cost += cost;
        }
      });
    });

    const overallMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    const categoryMarginData = Object.entries(categoryData).map(([catId, data]) => {
      const margin = data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0;
      return {
        name: categories.find(c => c.id === Number(catId))?.name || 'غير مصنف',
        margin
      };
    }).sort((a, b) => b.margin - a.margin);

    const monthlyTrendData = Object.entries(monthlyData).map(([monthName, data]) => {
        const margin = data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0;
        return {
            name: monthName,
            'هامش الربح': margin,
        };
    }).sort((a,b) => monthNames.indexOf(a.name) - monthNames.indexOf(b.name));

    const kpis = {
      overallMargin,
      bestCategory: categoryMarginData[0] || { name: '-', margin: 0 },
      worstCategory: categoryMarginData[categoryMarginData.length - 1] || { name: '-', margin: 0 }
    };

    return { kpis, categoryMarginData, monthlyTrendData };
  }, [selectedPeriodId, financialPeriods, salesOrders, products, categories]);

  const KpiCard: React.FC<{title: string, value: string, icon: React.ReactNode, color: string}> = ({title, value, icon, color}) => (
     <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center">
        <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${color} mb-2`}>{icon}</div>
        <h3 className="text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
    </div>
  );

  const chartTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary-dark');

  return (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b pb-4 border-[var(--border-light)] dark:border-[var(--border-dark)]">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تحليل هامش الربح</h2>
          <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">تحليل هوامش الربح الإجمالية وحسب فئات المنتجات.</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 no-print">
          <div className="w-48">
            <label htmlFor="period" className="text-xs">الفترة المالية:</label>
            <select id="period" value={selectedPeriodId} onChange={e => setSelectedPeriodId(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md">
              {financialPeriods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
            <PrinterIcon /> طباعة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KpiCard title="متوسط هامش الربح" value={formatPercent(reportData.kpis.overallMargin)} icon={<PercentageIcon className="w-5 h-5 text-white" />} color="bg-blue-500" />
        <KpiCard title="الفئة الأعلى ربحية" value={reportData.kpis.bestCategory.name} icon={<TrendingUpIcon className="w-5 h-5 text-white" />} color="bg-green-500" />
        <KpiCard title="الفئة الأقل ربحية" value={reportData.kpis.worstCategory.name} icon={<TrendingDownIcon className="w-5 h-5 text-white" />} color="bg-red-500" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="h-96">
            <h3 className="text-lg font-semibold mb-4 text-center">هامش الربح حسب الفئة</h3>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.categoryMarginData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                    <XAxis type="number" tickFormatter={(value) => `${value}%`} tick={{ fill: chartTextColor }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: chartTextColor, fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => formatPercent(value)} />
                    <Bar dataKey="margin" name="هامش الربح" fill="var(--primary-color)" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="h-96">
            <h3 className="text-lg font-semibold mb-4 text-center">اتجاه هامش الربح الشهري</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.monthlyTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                    <XAxis dataKey="name" tick={{ fill: chartTextColor }} />
                    <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fill: chartTextColor }} />
                    <Tooltip formatter={(value: number) => formatPercent(value)} />
                    <Legend wrapperStyle={{ direction: 'rtl' }} formatter={(value) => <span className="text-gray-600 dark:text-gray-400">{value}</span>}/>
                    <Line type="monotone" dataKey="هامش الربح" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportProfitMargin;