import React, { useState, useEffect } from 'react';
import type { User, UserRole } from './types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  user: User | null;
}

const userRoles: UserRole[] = ['مدير النظام', 'مدير مبيعات', 'مسؤول مشتريات', 'أخصائي موارد بشرية', 'مدير مخزون', 'موظف'];
const statuses: Array<'Active' | 'Inactive'> = ['Active', 'Inactive'];

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const isCreateMode = !user;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'موظف' as UserRole,
    status: 'Active' as 'Active' | 'Inactive',
  });

  useEffect(() => {
    if (user) { // Edit mode
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        status: user.status,
      });
    } else { // Create mode, reset to defaults
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'موظف',
        status: 'Active',
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreateMode) {
      onSave({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
    } else {
      onSave({
        name: formData.name,
        role: formData.role,
        status: formData.status
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-lg p-6 relative transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {isCreateMode ? 'إضافة مستخدم جديد' : `تعديل المستخدم: ${user.name}`}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">اسم المستخدم</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">البريد الإلكتروني</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required={isCreateMode} disabled={!isCreateMode} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-gray-700/50" />
          </div>

          {isCreateMode && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">كلمة المرور</label>
              <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">الدور</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]">
                {userRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            {!isCreateMode && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">الحالة</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]">
                  {statuses.map(status => (
                    <option key={status} value={status}>{status === 'Active' ? 'نشط' : 'غير نشط'}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              إلغاء
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]">
              {isCreateMode ? 'إنشاء المستخدم' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;