import React, { useState, useEffect } from 'react';
import type { FeasibilityStudy, Currency } from './types';
import FeasibilityStudyPDF from './FeasibilityStudyPDF';
import { DollarSignIcon, ArchiveIcon, TrendingUpIcon, PercentageIcon, PrinterIcon } from './Icons';

interface FeasibilityStudyDetailProps {
  study: FeasibilityStudy;
  onBack: () => void;
  currency: Currency;
}

const KpiCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{title}</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

const FeasibilityStudyDetail: React.FC<FeasibilityStudyDetailProps> = ({ study, onBack, currency }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);

  useEffect(() => {
    if (isPrinting) {
      const handleAfterPrint = () => {
        setIsPrinting(false);
        document.body.classList.remove('print-body');
      };

      window.addEventListener('afterprint', handleAfterPrint);
      document.body.classList.add('print-body');
      window.print();

      return () => {
        window.removeEventListener('afterprint', handleAfterPrint);
        document.body.classList.remove('print-body');
      };
    }
  }, [isPrinting]);

  const mainContent = (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b pb-4 border-[var(--border-light)] dark:border-[var(--border-dark)] no-print">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تفاصيل دراسة الجدوى</h2>
          <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
            {study.sourceType}: <span className="font-semibold">{study.sourceId}</span> | تاريخ الإنشاء: {new Date(study.creationDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button onClick={() => setIsPrinting(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
            <PrinterIcon /> طباعة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="رأس المال (التكلفة)" value={formatCurrency(study.totalCost)} icon={<ArchiveIcon className="w-5 h-5 text-white" />} color="bg-red-500" />
        <KpiCard title="الإيرادات المتوقعة" value={formatCurrency(study.totalExpectedRevenue)} icon={<DollarSignIcon className="w-5 h-5 text-white" />} color="bg-blue-500" />
        <KpiCard title="صافي الربح المتوقع" value={formatCurrency(study.totalExpectedProfit)} icon={<TrendingUpIcon className="w-5 h-5 text-white" />} color="bg-green-500" />
        <KpiCard title="متوسط هامش الربح" value={`${study.averageMargin.toFixed(2)}%`} icon={<PercentageIcon className="w-5 h-5 text-white" />} color="bg-yellow-500" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2">المنتج</th>
              <th className="px-4 py-2">الكمية</th>
              <th className="px-4 py-2">تكلفة الوحدة</th>
              <th className="px-4 py-2">سعر البيع</th>
              <th className="px-4 py-2">ربح الوحدة</th>
              <th className="px-4 py-2">إجمالي الربح</th>
            </tr>
          </thead>
          <tbody>
            {study.items.map(item => (
              <tr key={item.productId} className="border-b dark:border-gray-700">
                <td className="px-4 py-2 font-medium">{item.productName}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{formatCurrency(item.finalCostPrice)}</td>
                <td className="px-4 py-2">{formatCurrency(item.sellingPrice)}</td>
                <td className={`px-4 py-2 font-semibold ${item.unitProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(item.unitProfit)}</td>
                <td className={`px-4 py-2 font-bold ${item.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(item.totalProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <div className="no-print">
        <button onClick={onBack} className="mb-4 text-sm text-blue-600 hover:underline">&larr; العودة إلى قائمة الدراسات</button>
        {mainContent}
      </div>
      <div className="print-only">
        <style>{`
          @media print {
            body.print-body > #root > div {
              display: none;
            }
            body.print-body > .feasibility-print-area {
              display: block !important;
            }
          }
        `}</style>
        <div className="feasibility-print-area">
          <FeasibilityStudyPDF study={study} currency={currency} />
        </div>
      </div>
    </>
  );
};

export default FeasibilityStudyDetail;