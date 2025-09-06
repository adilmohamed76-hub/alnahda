import React, { useState } from 'react';
import type { ProductCategory, Permission } from './types';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';
import CategoryModal from './CategoryModal';
import ConfirmationModal from './ConfirmationModal';

interface CategoryManagementProps {
  categories: ProductCategory[];
  onSave: (category: Omit<ProductCategory, 'id'> & { id?: number }) => void;
  onDelete: (categoryId: number) => void;
  hasPermission: (permission: Permission) => boolean;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onSave, onDelete, hasPermission }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (category: ProductCategory) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleOpenDeleteConfirm = (category: ProductCategory) => {
    setCategoryToDelete(category);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      onDelete(categoryToDelete.id);
      setConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };
  
  const handleSave = (category: Omit<ProductCategory, 'id'> & { id?: number }) => {
    onSave(category);
    setModalOpen(false);
  };
  
  const getTypeChip = (isPerishable: boolean) => {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    return isPerishable 
      ? `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`
      : `${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
  };
  
  if (!hasPermission('VIEW_CATEGORIES')) {
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة التصنيفات</h1>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex justify-end mb-6">
          {hasPermission('MANAGE_CATEGORIES') && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]"
            >
              <PlusIcon />
              إضافة تصنيف جديد
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">اسم التصنيف</th>
                <th scope="col" className="px-6 py-3">النوع</th>
                <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {category.name}
                  </th>
                  <td className="px-6 py-4">
                    <span className={getTypeChip(category.isPerishable)}>
                      {category.isPerishable ? 'قابل للتلف' : 'غير قابل للتلف'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      {hasPermission('MANAGE_CATEGORIES') && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(category)}
                            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(category)}
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
          {categories.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              لم تتم إضافة أي تصنيفات بعد.
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          category={editingCategory}
        />
      )}

      {isConfirmOpen && categoryToDelete && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          title="تأكيد الحذف"
          message={`هل أنت متأكد من رغبتك في حذف التصنيف "${categoryToDelete.name}"؟`}
        />
      )}
    </>
  );
};

export default CategoryManagement;