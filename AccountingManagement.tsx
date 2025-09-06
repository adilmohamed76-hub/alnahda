import React, { useState } from 'react';
import type { Account, JournalEntry, Permission, FinancialPeriod } from './types';
import ChartOfAccounts from './ChartOfAccounts';
import JournalEntriesList from './JournalEntriesList';
import GeneralLedger from './GeneralLedger';
import FinancialPeriods from './FinancialPeriods';

interface AccountingManagementProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  financialPeriods: FinancialPeriod[];
  onSaveAccount: (account: Omit<Account, 'id' | 'balance'> & { id?: number }) => void;
  onCreateJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  onClosePeriod: (periodId: number) => void;
  hasPermission: (permission: Permission) => boolean;
}

type AccountingTab = 'chartOfAccounts' | 'journalEntries' | 'generalLedger' | 'financialPeriods';

const AccountingManagement: React.FC<AccountingManagementProps> = (props) => {
  const { hasPermission, financialPeriods, onClosePeriod } = props;
  const [activeTab, setActiveTab] = useState<AccountingTab>('journalEntries');

  if (!hasPermission('VIEW_ACCOUNTING')) {
    return (
      <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
        <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }
  
  const TabButton: React.FC<{ tab: AccountingTab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`whitespace-nowrap flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm ${
        activeTab === tab
          ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
          : 'border-transparent text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'chartOfAccounts':
        return <ChartOfAccounts accounts={props.accounts} onSave={props.onSaveAccount} hasPermission={hasPermission} />;
      case 'journalEntries':
        return <JournalEntriesList journalEntries={props.journalEntries} accounts={props.accounts} onCreate={props.onCreateJournalEntry} hasPermission={hasPermission} />;
      case 'generalLedger':
        return <GeneralLedger accounts={props.accounts} journalEntries={props.journalEntries} />;
      case 'financialPeriods':
        return <FinancialPeriods periods={financialPeriods} onClose={onClosePeriod} hasPermission={hasPermission} />;
      default:
        return null;
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة الحسابات</h1>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="border-b border-[var(--border-light)] dark:border-[var(--border-dark)] mb-6">
          <nav className="-mb-px flex space-x-reverse space-x-6" aria-label="Tabs">
            <TabButton tab="journalEntries" label="دفتر اليومية" />
            <TabButton tab="generalLedger" label="دفتر الأستاذ العام" />
            <TabButton tab="chartOfAccounts" label="شجرة الحسابات" />
            <TabButton tab="financialPeriods" label="الفترات المالية" />
          </nav>
        </div>
        {renderContent()}
      </div>
    </>
  );
};

export default AccountingManagement;