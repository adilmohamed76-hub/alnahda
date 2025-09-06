import React, { useState, useMemo } from 'react';
import type { Account, JournalEntryItem } from './types';
import { PlusIcon, TrashIcon } from './Icons';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (entry: { description: string; date: string; items: JournalEntryItem[] }) => void;
  accounts: Account[];
}

const JournalEntryModal: React.FC<JournalEntryModalProps> = ({ isOpen, onClose, onCreate, accounts }) => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Omit<JournalEntryItem, 'accountName'>[]>([
    { accountId: 0, debit: 0, credit: 0 },
    { accountId: 0, debit: 0, credit: 0 },
  ]);

  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    const totalDebit = items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = items.reduce((sum, item) => sum + item.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
    return { totalDebit, totalCredit, isBalanced };
  }, [items]);

  const handleItemChange = (index: number, field: keyof Omit<JournalEntryItem, 'accountName'>, value: string) => {
    const newItems = [...items];
    const numValue = parseFloat(value) || 0;
    
    if (field === 'accountId') {
        newItems[index][field] = parseInt(value, 10);
    } else if (field === 'debit' && numValue >= 0) {
        newItems[index].debit = numValue;
        newItems[index].credit = 0; // Ensure only one can be non-zero
    } else if (field === 'credit' && numValue >= 0) {
        newItems[index].credit = numValue;
        newItems[index].debit = 0;
    }
    setItems(newItems);
  };
  
  const addItem = () => setItems([...items, { accountId: 0, debit: 0, credit: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (!isBalanced || items.some(i => !i.accountId)) {
      alert('القيد غير متوازن أو لم يتم تحديد جميع الحسابات.');
      return;
    }
    const finalItems = items
        .filter(i => i.debit > 0 || i.credit > 0)
        .map(item => ({...item, accountName: accounts.find(a => a.id === item.accountId)?.name || 'غير معروف' }));

    onCreate({ description, date, items: finalItems });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-4xl p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">إنشاء قيد يومية يدوي</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="الوصف" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
        </div>

        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="py-2">الحساب</th><th className="py-2">مدين</th><th className="py-2">دائن</th><th></th></tr></thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td><select value={item.accountId} onChange={e => handleItemChange(index, 'accountId', e.target.value)} className="w-full p-1 bg-gray-100 dark:bg-gray-800 rounded"><option value={0} disabled>اختر حساب</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.number} - {a.name}</option>)}</select></td>
                  <td><input type="number" step="0.01" value={item.debit || ''} onChange={e => handleItemChange(index, 'debit', e.target.value)} className="w-full p-1 bg-gray-100 dark:bg-gray-800 rounded" /></td>
                  <td><input type="number" step="0.01" value={item.credit || ''} onChange={e => handleItemChange(index, 'credit', e.target.value)} className="w-full p-1 bg-gray-100 dark:bg-gray-800 rounded" /></td>
                  <td><button onClick={() => removeItem(index)} className="p-1 text-red-500"><TrashIcon /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} className="text-sm flex items-center gap-1 mt-2 text-blue-500"><PlusIcon /> إضافة سطر</button>

        <div className="flex justify-between items-center mt-4 pt-4 border-t font-bold">
            <div className="flex gap-4">
                <span>الإجمالي المدين: <span className="text-green-600">{totalDebit.toFixed(2)}</span></span>
                <span>الإجمالي الدائن: <span className="text-red-600">{totalCredit.toFixed(2)}</span></span>
            </div>
            <span className={isBalanced ? 'text-green-500' : 'text-red-500'}>{isBalanced ? 'متوازن' : 'غير متوازن'}</span>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg" disabled={!isBalanced}>إنشاء القيد</button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryModal;