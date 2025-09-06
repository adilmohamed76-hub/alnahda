import React, { useState } from 'react';
import type { Permission, SalesOrder, PurchaseOrder, Product, Customer, Supplier, Currency, FinancialPeriod, ProductCategory, View } from './types';
import { SalesIcon, PurchasesIcon, CubeIcon, ArchiveIcon, ChartBarIcon, ChartPieIcon, MapIcon, PercentageIcon, LightbulbIcon } from './Icons';
import ReportSalesSummary from './ReportSalesSummary';
import ReportPurchaseSummary from './ReportPurchaseSummary';
import ReportProductPerformance from './ReportProductPerformance';
import ReportInventoryValuation from './ReportInventoryValuation';
import ReportIncomeStatement from './ReportIncomeStatement';
import ReportSalesByRegion from './ReportSalesByRegion';
import ReportProfitMargin from './ReportProfitMargin';

interface ReportsManagementProps {
  hasPermission: (permission: Permission) => boolean;
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  currency: Currency;
  financialPeriods: FinancialPeriod[];
  categories: ProductCategory[];
  onNavigate: (view: View) => void;
}

type ReportType = 'hub' | 'salesSummary' | 'purchaseSummary' | 'productPerformance' | 'inventoryValuation' | 'incomeStatement' | 'salesByRegion' | 'profitMargin';

const reportsList: {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  permission: Permission;
  isExternal?: boolean;
  externalView?: View;
}[] = [
  { id: 'salesSummary', title: 'ملخص المبيعات', description: 'تحليل الإيرادات والمبيعات حسب العملاء.', icon: <SalesIcon />, permission: 'VIEW_SALES_REPORTS' },
  { id: 'purchaseSummary', title: 'ملخص المشتريات', description: 'تحليل المصروفات والمشتريات حسب الموردين.', icon: <PurchasesIcon />, permission: 'VIEW_PURCHASE_REPORTS' },
  { id: 'productPerformance', title: 'أداء المنتجات', description: 'عرض المنتجات الأكثر مبيعاً من حيث الكمية والقيمة.', icon: <CubeIcon />, permission: 'VIEW_SALES_REPORTS' },
  { id: 'inventoryValuation', title: 'تقييم المخزون', description: 'عرض القيمة الإجمالية للمخزون الحالي.', icon: <ArchiveIcon />, permission: 'VIEW_INVENTORY_REPORTS' },
  { id: 'incomeStatement', title: 'تقرير الدخل', description: 'عرض الإيرادات والمصروفات وصافي الربح عبر الزمن.', icon: <ChartPieIcon />, permission: 'VIEW_ACCOUNTING' },
  { id: 'salesByRegion', title: 'المبيعات حسب المنطقة', description: 'خريطة حرارية لتوزيع المبيعات جغرافياً.', icon: <MapIcon />, permission: 'VIEW_SALES_REPORTS' },
  { id: 'profitMargin', title: 'تحليل هامش الربح', description: 'عرض هوامش الربح حسب الفئات والاتجاه الزمني.', icon: <PercentageIcon />, permission: 'VIEW_SALES_REPORTS' },
  { id: 'hub', title: 'دراسة الجدوى', description: 'تحليل ربحية أوامر الشراء والمخزون.', icon: <LightbulbIcon />, permission: 'VIEW_FEASIBILITY_STUDIES', isExternal: true, externalView: 'feasibility' },
];

const ReportsManagement: React.FC<ReportsManagementProps> = (props) => {
  const { hasPermission, onNavigate } = props;
  const [activeReport, setActiveReport] = useState<ReportType>('hub');

  const availableReports = reportsList.filter(report => hasPermission(report.permission));

  const handleCardClick = (reportId: ReportType, isExternal?: boolean, externalView?: View) => {
      if (isExternal && externalView) {
          onNavigate(externalView);
      } else {
          setActiveReport(reportId);
      }
  };
  
  const renderReportContent = () => {
    switch(activeReport) {
      case 'salesSummary': return <ReportSalesSummary {...props} />;
      case 'purchaseSummary': return <ReportPurchaseSummary {...props} />;
      case 'productPerformance': return <ReportProductPerformance {...props} />;
      case 'inventoryValuation': return <ReportInventoryValuation {...props} />;
      case 'incomeStatement': return <ReportIncomeStatement {...props} />;
      case 'salesByRegion': return <ReportSalesByRegion {...props} />;
      case 'profitMargin': return <ReportProfitMargin {...props} />;
      default: return null;
    }
  };

  if (!hasPermission('VIEW_REPORTS')) {
    return (
      <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
        <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }

  if (activeReport !== 'hub') {
    return (
      <>
        <button 
          onClick={() => setActiveReport('hub')}
          className="mb-6 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 no-print"
        >
          &rarr; العودة إلى قائمة التقارير
        </button>
        {renderReportContent()}
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">مركز التقارير</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableReports.map(report => (
          <div 
            key={report.id}
            onClick={() => handleCardClick(report.id, report.isExternal, report.externalView)}
            className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 text-[var(--primary-color)] rounded-full p-3">
                {report.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{report.title}</h2>
                <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-1">{report.description}</p>
              </div>
            </div>
          </div>
        ))}
         {availableReports.length === 0 && (
            <div className="col-span-full text-center p-8 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">لا توجد تقارير متاحة</h3>
                <p>لم يتم منحك صلاحية الوصول إلى أي تقارير. يرجى مراجعة مدير النظام.</p>
            </div>
         )}
      </div>
    </>
  );
};

export default ReportsManagement;