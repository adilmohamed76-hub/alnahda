import React, { useState } from 'react';
import type { FeasibilityStudy, Permission, Currency } from './types';
import { LightbulbIcon } from './Icons';
import FeasibilityStudyDetail from './FeasibilityStudyDetail';

interface FeasibilityStudyManagementProps {
  studies: FeasibilityStudy[];
  hasPermission: (permission: Permission) => boolean;
  currency: Currency;
}

const FeasibilityStudyManagement: React.FC<FeasibilityStudyManagementProps> = ({ studies, hasPermission, currency }) => {
  const [selectedStudy, setSelectedStudy] = useState<FeasibilityStudy | null>(null);

  if (!hasPermission('VIEW_FEASIBILITY_STUDIES')) {
    return (
      <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
        <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }

  if (selectedStudy) {
    return <FeasibilityStudyDetail study={selectedStudy} onBack={() => setSelectedStudy(null)} currency={currency} />;
  }
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);


  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">دراسات الجدوى</h1>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="space-y-4">
          {studies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
                <LightbulbIcon className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-xl font-semibold">لا توجد دراسات جدوى بعد</h3>
                <p className="mt-2 max-w-md mx-auto">
                    يمكنك إنشاء دراسة جدوى جديدة من صفحة <span className="font-bold">إدارة المشتريات</span> (للفواتير المستلمة) أو من صفحة <span className="font-bold">إدارة المخزون</span> (للمخزون الحالي).
                </p>
            </div>
          ) : (
             [...studies].sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).map(study => (
                <div 
                    key={study.id} 
                    onClick={() => setSelectedStudy(study)}
                    className="p-4 border border-[var(--border-light)] dark:border-[var(--border-dark)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">{study.sourceType} - {new Date(study.creationDate).toLocaleDateString()}</p>
                            <h3 className="text-lg font-bold text-[var(--primary-color)]">{study.sourceId}</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 md:mt-0 text-center w-full md:w-auto max-w-lg">
                            <div>
                                <p className="text-xs uppercase text-gray-500">التكلفة</p>
                                <p className="font-bold text-red-600">{formatCurrency(study.totalCost)}</p>
                            </div>
                             <div>
                                <p className="text-xs uppercase text-gray-500">الإيراد المتوقع</p>
                                <p className="font-bold text-gray-800 dark:text-white">{formatCurrency(study.totalExpectedRevenue)}</p>
                            </div>
                             <div>
                                <p className="text-xs uppercase text-gray-500">الربح المتوقع</p>
                                <p className="font-bold text-green-600">{formatCurrency(study.totalExpectedProfit)}</p>
                            </div>
                        </div>
                    </div>
                </div>
             ))
          )}
        </div>
      </div>
    </>
  );
};

export default FeasibilityStudyManagement;