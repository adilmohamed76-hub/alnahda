import React, { useState, useEffect } from 'react';
import type { Warehouse, WarehouseType } from './types';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: Omit<Warehouse, 'id'> & { id?: number }) => void;
  warehouse: Warehouse | null;
}

const warehouseTypes: WarehouseType[] = ['رئيسي', 'فرعي', 'بضاعة في الطريق', 'مهمة خاصة'];

const WarehouseModal: React.FC<WarehouseModalProps> = ({ isOpen, onClose, onSave, warehouse }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: warehouseTypes[0],
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({ name: warehouse.name, type: warehouse.type });
    } else {
      setFormData({ name: '', type: warehouseTypes[0] });
    }
  }, [warehouse, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: warehouse?.id, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {warehouse ? 'تعديل المخزن' : 'إضافة مخزن جديد'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المخزن</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع المخزن</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              {warehouseTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
            <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">{warehouse ? 'حفظ التعديلات' : 'إضافة المخزن'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseModal;
