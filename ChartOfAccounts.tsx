import React, { useState } from 'react';
import type { Account, Permission } from './types';
import { PlusIcon, PencilIcon } from './Icons';
import AccountModal from './AccountModal';

interface ChartOfAccountsProps {
  accounts: Account[];
  onSave: (account: Omit<Account, 'id' | 'balance'> & { id?: number }) => void;
  hasPermission: (permission: Permission) => boolean;
}

const ChartOfAccounts: React.FC<ChartOfAccountsProps> = ({ accounts, onSave, hasPermission }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (account: Account) => {
    setEditingAccount(account);
    setModalOpen(true);
  };
  
  const handleSave = (accountData: Omit<Account, 'id' | 'balance'> & { id?: number }) => {
    onSave(accountData);
    setModalOpen(false);
  };
  
  const canManage = hasPermission('MANAGE_CHART_OF_ACCOUNTS');

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">شجرة الحسابات</h2>
        {canManage && (
          <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg">
            <PlusIcon /> إضافة حساب
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3">الرقم</th>
              <th className="px-6 py-3">اسم الحساب</th>
              <th className="px-6 py-3">النوع</th>
              <th className="px-6 py-3">الرصيد</th>
              <th className="px-6 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {accounts.sort((a,b) => a.number.localeCompare(b.number)).map(acc => (
              <tr key={acc.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-mono">{acc.number}</td>
                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">{acc.name}</th>
                <td className="px-6 py-4">{acc.type}</td>
                <td className="px-6 py-4 font-mono">{acc.balance.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  {canManage && (
                    <button onClick={() => handleOpenEditModal(acc)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full">
                      <PencilIcon />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <AccountModal 
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          account={editingAccount}
        />
      )}
    </>
  );
};

export default ChartOfAccounts;