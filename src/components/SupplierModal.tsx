import React, { useState, useEffect } from 'react';
import type { Supplier, BankAccount, Currency } from '../types/index';
import { PlusIcon, TrashIcon } from './Icons';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id'> & { id?: number }) => void;
  supplier: Supplier | null;
  currencies: Currency[];
}

const initialFormState = {
  name: '',
  type: 'محلي' as 'محلي' | 'أجنبي',
  currencyCode: 'LYD' as 'LYD' | 'USD' | 'EUR' | 'GBP',
  contactPerson: '',
  email: '',
  phone: '',
  bankAccounts: [] as Omit<BankAccount, 'id'>[],
};

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, supplier, currencies }) => {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (supplier) {
      setFormData({ ...supplier });
    } else {
      setFormData(initialFormState);
    }
  }, [supplier, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBankAccountChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newBankAccounts = [...formData.bankAccounts];
    (newBankAccounts[index] as any)[name] = value;
    setFormData(prev => ({ ...prev, bankAccounts: newBankAccounts }));
  };

  const addBankAccount = () => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, { bankName: '', accountNumber: '', iban: '' }],
    }));
  };

  const removeBankAccount = (index: number) => {
    const newBankAccounts = formData.bankAccounts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, bankAccounts: newBankAccounts }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
        ...formData,
        bankAccounts: formData.bankAccounts.map((acc, index) => ({...acc, id: supplier?.bankAccounts[index]?.id || Date.now() + index }))
    };
    onSave({
        id: supplier?.id,
        ...finalData,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 overflow-y-auto"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-3xl p-6 my-8 relative transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {supplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">اسم المورد</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">مسؤول التواصل</label>
              <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">البريد الإلكتروني</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">رقم الهاتف</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">نوع المورد</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]">
                <option value="محلي">محلي</option>
                <option value="أجنبي">أجنبي</option>
              </select>
            </div>
            <div>
              <label htmlFor="currencyCode" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">عملة التعامل</label>
              <select name="currencyCode" id="currencyCode" value={formData.currencyCode} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]">
                {currencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)]">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">الحسابات البنكية</h3>
                <button type="button" onClick={addBankAccount} className="flex items-center gap-1 text-sm text-[var(--primary-color)] hover:underline">
                    <PlusIcon className="w-4 h-4" /> إضافة حساب
                </button>
            </div>
            <div className="space-y-3">
              {formData.bankAccounts.map((account, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">اسم البنك</label>
                    <input type="text" name="bankName" value={account.bankName} onChange={(e) => handleBankAccountChange(index, e)} required className="w-full text-sm p-1.5 bg-white dark:bg-gray-800 rounded-md"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">رقم الحساب</label>
                    <input type="text" name="accountNumber" value={account.accountNumber} onChange={(e) => handleBankAccountChange(index, e)} required className="w-full text-sm p-1.5 bg-white dark:bg-gray-800 rounded-md"/>
                  </div>
                   <div className="md:col-span-2">
                    <label className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">IBAN</label>
                    <input type="text" name="iban" value={account.iban} onChange={(e) => handleBankAccountChange(index, e)} className="w-full text-sm p-1.5 bg-white dark:bg-gray-800 rounded-md"/>
                  </div>
                  <div>
                     <button type="button" onClick={() => removeBankAccount(index)} className="w-full p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md" aria-label={`حذف حساب بنك ${account.bankName}`}>
                        <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
              {formData.bankAccounts.length === 0 && <p className="text-xs text-center text-gray-500 py-4">لم تتم إضافة أي حسابات بنكية.</p>}
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)] mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              إلغاء
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]">
              {supplier ? 'حفظ التعديلات' : 'إضافة المورد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
