import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for type definitions
import type { Customer, CustomerType } from '../types/index';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id'> & { id?: number }) => Promise<any>;
  customer: Customer | null;
  initialName?: string;
}

const customerTypes: CustomerType[] = ['عادي', 'مميز', 'جهة اعتبارية'];

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSave, customer, initialName }) => {
  // FIX: Add region property to state and form to match Customer type
  const [formData, setFormData] = useState({
    name: '',
    type: customerTypes[0],
    email: '',
    phone: '',
    region: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({ name: customer.name, type: customer.type, email: customer.email, phone: customer.phone, region: customer.region });
    } else {
      setFormData({ name: initialName || '', type: customerTypes[0], email: '', phone: '', region: '' });
    }
  }, [customer, isOpen, initialName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ id: customer?.id, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {customer ? 'تعديل العميل' : 'إضافة عميل جديد'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم العميل</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التصنيف</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              {customerTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المنطقة</label>
            <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
            <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">{customer ? 'حفظ التعديلات' : 'إضافة العميل'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;