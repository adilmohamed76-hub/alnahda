import React, { useState, useMemo } from 'react';
import type { Account, JournalEntry } from './types';

interface GeneralLedgerProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
}

const GeneralLedger: React.FC<GeneralLedgerProps> = ({ accounts, journalEntries }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>(accounts[0]?.id || '');

  const ledgerData = useMemo(() => {
    if (!selectedAccountId) return { transactions: [], openingBalance: 0, closingBalance: 0 };

    const selectedAccount = accounts.find(a => a.id === selectedAccountId)!;
    
    const transactions = journalEntries
      .flatMap(entry =>
        entry.items
          .filter(item => item.accountId === selectedAccountId)
          .map(item => ({
            date: entry.date,
            description: entry.description,
            reference: entry.reference,
            debit: item.debit,
            credit: item.credit,
          }))
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = selectedAccount.balance - transactions.reduce((sum, t) => {
        const balanceChange = t.debit - t.credit;
        if(selectedAccount.type === 'الأصول' || selectedAccount.type === 'المصروفات') return sum + balanceChange;
        return sum - balanceChange;
    }, 0);
    
    const openingBalance = runningBalance;

    const transactionsWithBalance = transactions.map(t => {
        const balanceChange = t.debit - t.credit;
        if(selectedAccount.type === 'الأصول' || selectedAccount.type === 'المصروفات') {
            runningBalance += balanceChange;
        } else {
            runningBalance -= balanceChange;
        }
        return { ...t, balance: runningBalance };
    });

    return { transactions: transactionsWithBalance, openingBalance, closingBalance: selectedAccount.balance };
  }, [selectedAccountId, accounts, journalEntries]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">دفتر الأستاذ العام</h2>
        <div className="w-1/3">
          <label className="block text-sm font-medium mb-1">اختر الحساب</label>
          <select value={selectedAccountId} onChange={e => setSelectedAccountId(Number(e.target.value))} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.number} - {acc.name}</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2">التاريخ</th>
              <th className="px-4 py-2">الوصف</th>
              <th className="px-4 py-2">المرجع</th>
              <th className="px-4 py-2">مدين</th>
              <th className="px-4 py-2">دائن</th>
              <th className="px-4 py-2">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-100 dark:bg-gray-900/50 font-bold">
                <td colSpan={5} className="px-4 py-2">رصيد افتتاحي</td>
                <td className="px-4 py-2 font-mono">{ledgerData.openingBalance.toFixed(2)}</td>
            </tr>
            {ledgerData.transactions.map((t, index) => (
              <tr key={index} className="border-b dark:border-gray-700">
                <td className="px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{t.description}</td>
                <td className="px-4 py-2 font-mono text-xs">{t.reference}</td>
                <td className="px-4 py-2 font-mono text-green-600">{t.debit > 0 ? t.debit.toFixed(2) : '-'}</td>
                <td className="px-4 py-2 font-mono text-red-600">{t.credit > 0 ? t.credit.toFixed(2) : '-'}</td>
                <td className="px-4 py-2 font-mono">{t.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 dark:bg-gray-900/50 font-bold text-base">
              <tr>
                  <td colSpan={5} className="px-4 py-3 text-left">الرصيد النهائي</td>
                  <td className="px-4 py-3 font-mono">{ledgerData.closingBalance.toFixed(2)}</td>
              </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default GeneralLedger;