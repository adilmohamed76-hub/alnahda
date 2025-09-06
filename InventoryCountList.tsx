import React, { useState } from 'react';
import type { InventoryCount, Warehouse, Permission } from './types';
import { PlusIcon, ClipboardCheckIcon } from './Icons';

interface InventoryCountListProps {
  counts: InventoryCount[];
  warehouses: Warehouse[];
  onStartNew: (warehouseId: number) => void;
  onView: (count: InventoryCount) => void;
  hasPermission: (permission: Permission) => boolean;
}

const InventoryCountList: React.FC<InventoryCountListProps> = ({ counts, warehouses, onStartNew, onView, hasPermission }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>(warehouses[0]?.id || '');

  const getWarehouseName = (id: number) => warehouses.find(w => w.id === id)?.name || 'غير معروف';
  
  const canManage = hasPermission('MANAGE_INVENTORY_COUNTS');

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">عمليات جرد المخزون</h2>
        {canManage && (
            <div className="flex items-center gap-2">
            <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm"
            >
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button
                onClick={() => selectedWarehouse && onStartNew(selectedWarehouse)}
                disabled={!selectedWarehouse}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)] disabled:bg-gray-400"
            >
                <PlusIcon /> بدء جرد جديد
            </button>
            </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3">رقم الجرد</th>
              <th className="px-6 py-3">المخزن</th>
              <th className="px-6 py-3">التاريخ</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {counts.map(count => (
              <tr key={count.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-mono">IC-{count.id}</td>
                <td className="px-6 py-4 font-medium">{getWarehouseName(count.warehouseId)}</td>
                <td className="px-6 py-4">{new Date(count.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${count.status === 'معتمد' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {count.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onView(count)} className="text-blue-600 hover:underline text-sm">
                    {count.status === 'مسودة' && canManage ? 'إكمال الجرد' : 'عرض التفاصيل'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {counts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <ClipboardCheckIcon className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">لا توجد عمليات جرد</h3>
                <p>ابدأ عملية جرد جديدة لتسوية كميات المخزون.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default InventoryCountList;