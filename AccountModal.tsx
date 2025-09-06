import React, { useState, useEffect } from 'react';
import type { Account, AccountType } from './types';
import { AccountTypes } from './types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id' | 'balance'> & { id?: number }) => void;
  account: Account | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, account }) => {
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    type: AccountTypes[0],
  });

  useEffect(() => {
    if (account) {
      setFormData({ number: account.number, name: account.name, type: account.type });
    } else {
      setFormData({ number: '', name: '', type: AccountTypes[0] });
    }
  }, [account, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: account?.id, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{account ? 'تعديل الحساب' : 'إضافة حساب جديد'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">رقم الحساب</label>
            <input type="text" name="number" value={formData.number} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">اسم الحساب</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع الحساب</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              {AccountTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
            <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">{account ? 'حفظ' : 'إضافة'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;