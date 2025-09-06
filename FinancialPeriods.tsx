import React, { useState } from 'react';
import type { FinancialPeriod, Permission } from './types';
import { CalendarLockIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

interface FinancialPeriodsProps {
  periods: FinancialPeriod[];
  onClose: (periodId: number) => void;
  hasPermission: (permission: Permission) => boolean;
}

const FinancialPeriods: React.FC<FinancialPeriodsProps> = ({ periods, onClose, hasPermission }) => {
  const [periodToClose, setPeriodToClose] = useState<FinancialPeriod | null>(null);

  const handleConfirmClose = () => {
    if (periodToClose) {
      onClose(periodToClose.id);
      setPeriodToClose(null);
    }
  };

  const canManage = hasPermission('CLOSE_FINANCIAL_PERIODS');
  const openPeriod = periods.find(p => p.status === 'مفتوحة');

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">الفترات المالية</h2>
        {canManage && openPeriod && (
          <button
            onClick={() => setPeriodToClose(openPeriod)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            <CalendarLockIcon /> إغلاق الفترة الحالية
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        إغلاق الفترة يقوم بأرشفة بيانات الأداء ويمنع تسجيل أي عمليات بتاريخ يقع ضمنها.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3">اسم الفترة</th>
              <th className="px-6 py-3">تاريخ البدء</th>
              <th className="px-6 py-3">تاريخ الانتهاء</th>
              <th className="px-6 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium">{period.name}</td>
                <td className="px-6 py-4">{new Date(period.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{new Date(period.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${period.status === 'مغلقة' ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                    {period.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {periodToClose && (
        <ConfirmationModal
          isOpen={!!periodToClose}
          onClose={() => setPeriodToClose(null)}
          onConfirm={handleConfirmClose}
          title={`تأكيد إغلاق الفترة: ${periodToClose.name}`}
          message="سيتم أرشفة بيانات هذه الفترة ولن تتمكن من تسجيل أو تعديل أي عمليات بتاريخ يقع ضمنها. هل أنت متأكد؟"
        />
      )}
    </>
  );
};

export default FinancialPeriods;