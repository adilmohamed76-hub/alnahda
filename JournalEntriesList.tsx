import React, { useState } from 'react';
import type { JournalEntry, Account, Permission } from './types';
import { PlusIcon } from './Icons';
import JournalEntryModal from './JournalEntryModal';

interface JournalEntriesListProps {
  journalEntries: JournalEntry[];
  accounts: Account[];
  onCreate: (entry: Omit<JournalEntry, 'id'>) => void;
  hasPermission: (permission: Permission) => boolean;
}

const JournalEntriesList: React.FC<JournalEntriesListProps> = ({ journalEntries, accounts, onCreate, hasPermission }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const canCreate = hasPermission('CREATE_JOURNAL_ENTRIES');

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">دفتر اليومية</h2>
        {canCreate && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg">
            <PlusIcon /> إضافة قيد يدوي
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2">التاريخ</th>
              <th className="px-4 py-2">المرجع</th>
              <th className="px-4 py-2">الوصف</th>
              <th className="px-4 py-2">الحساب</th>
              <th className="px-4 py-2">مدين</th>
              <th className="px-4 py-2">دائن</th>
            </tr>
          </thead>
          <tbody>
            {journalEntries.map(entry => (
              <React.Fragment key={entry.id}>
                {entry.items.map((item, index) => (
                  <tr key={`${entry.id}-${index}`} className={`border-b dark:border-gray-700 ${index === 0 ? 'border-t-2 border-t-gray-300 dark:border-t-gray-600' : ''}`}>
                    {index === 0 && (
                      <>
                        <td rowSpan={entry.items.length} className="px-4 py-2 align-top text-gray-900 dark:text-gray-100">{new Date(entry.date).toLocaleDateString()}</td>
                        <td rowSpan={entry.items.length} className="px-4 py-2 align-top font-mono text-xs">{entry.reference}</td>
                        <td rowSpan={entry.items.length} className="px-4 py-2 align-top">{entry.description}</td>
                      </>
                    )}
                    <td className={`px-4 py-2 ${item.debit > 0 ? 'pl-8' : 'pl-16'}`}>{item.accountName}</td>
                    <td className="px-4 py-2 font-mono text-green-600">{item.debit > 0 ? item.debit.toFixed(2) : '-'}</td>
                    <td className="px-4 py-2 font-mono text-red-600">{item.credit > 0 ? item.credit.toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <JournalEntryModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={onCreate}
          accounts={accounts}
        />
      )}
    </>
  );
};

export default JournalEntriesList;