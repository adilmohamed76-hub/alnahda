import React, { useState } from 'react';
import type { Warehouse, WarehouseType, Permission } from './types';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';
import WarehouseModal from './WarehouseModal';
import ConfirmationModal from './ConfirmationModal';

interface WarehouseManagementProps {
  warehouses: Warehouse[];
  onSave: (warehouse: Omit<Warehouse, 'id'> & { id?: number }) => void;
  onDelete: (warehouseId: number) => void;
  hasPermission: (permission: Permission) => boolean;
}

const WarehouseManagement: React.FC<WarehouseManagementProps> = ({ warehouses, onSave, onDelete, hasPermission }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);

  const handleOpenAddModal = () => {
    setEditingWarehouse(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setModalOpen(true);
  };

  const handleOpenDeleteConfirm = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    if (warehouseToDelete) {
      onDelete(warehouseToDelete.id);
      setConfirmOpen(false);
      setWarehouseToDelete(null);
    }
  };
  
  const handleSave = (warehouse: Omit<Warehouse, 'id'> & { id?: number }) => {
    onSave(warehouse);
    setModalOpen(false);
  };
  
  const getTypeChip = (type: WarehouseType) => {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (type) {
      case 'رئيسي': return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
      case 'فرعي': return `${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
      case 'بضاعة في الطريق': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
      case 'مهمة خاصة': return `${base} bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300`;
      default: return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  if (!hasPermission('VIEW_WAREHOUSES')) {
    return (
      <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
        <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة المخازن</h1>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex justify-end mb-6">
          {hasPermission('MANAGE_WAREHOUSES') && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]"
            >
              <PlusIcon />
              إضافة مخزن جديد
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">اسم المخزن</th>
                <th scope="col" className="px-6 py-3">النوع</th>
                <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {warehouse.name}
                  </th>
                  <td className="px-6 py-4">
                    <span className={getTypeChip(warehouse.type)}>{warehouse.type}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      {hasPermission('MANAGE_WAREHOUSES') && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(warehouse)}
                            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(warehouse)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                          >
                            <TrashIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {warehouses.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              لم يتم إضافة أي مخازن بعد.
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <WarehouseModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          warehouse={editingWarehouse}
        />
      )}

      {isConfirmOpen && warehouseToDelete && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          title="تأكيد الحذف"
          message={`هل أنت متأكد من رغبتك في حذف المخزن "${warehouseToDelete.name}"؟`}
        />
      )}
    </>
  );
};

export default WarehouseManagement;