import React, { useState, useEffect } from 'react';
import type { ProductCategory } from './types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<ProductCategory, 'id'> & { id?: number }) => void;
  category: ProductCategory | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, category }) => {
  const [formData, setFormData] = useState({
    name: '',
    isPerishable: false,
  });

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name, isPerishable: category.isPerishable });
    } else {
      setFormData({ name: '', isPerishable: false });
    }
  }, [category, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: category?.id, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {category ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">اسم التصنيف</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
             <input
                type="checkbox"
                name="isPerishable"
                id="isPerishable"
                checked={formData.isPerishable}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
            />
            <label htmlFor="isPerishable" className="text-sm font-medium">
                هل هذا التصنيف قابل للتلف؟
                <span className="block text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                    (سيجعل حقل تاريخ الصلاحية إجباريًا للمنتجات)
                </span>
            </label>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
            <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">{category ? 'حفظ التعديلات' : 'إضافة التصنيف'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
