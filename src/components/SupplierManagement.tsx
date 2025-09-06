import React, { useState, useMemo } from 'react';
import type { Supplier, Product, Notification, Currency, Permission } from '../types/index';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, ChevronRightIcon, BanknotesIcon, CubeIcon } from './Icons';
import SupplierModal from './SupplierModal';
import ConfirmationModal from './ConfirmationModal';

interface SupplierManagementProps {
  suppliers: Supplier[];
  products: Product[];
  onSave: (supplier: Omit<Supplier, 'id'> & { id?: number }) => void;
  onDelete: (supplierId: number) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  currencies: Currency[];
  hasPermission: (permission: Permission) => boolean;
}

type SupplierTab = 'local' | 'foreign';

const SupplierManagement: React.FC<SupplierManagementProps> = ({ suppliers, products, onSave, onDelete, addNotification, currencies, hasPermission }) => {
  const [activeTab, setActiveTab] = useState<SupplierTab>('local');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    const typeFilter = activeTab === 'local' ? 'محلي' : 'أجنبي';
    return suppliers.filter(s => 
      s.type === typeFilter &&
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suppliers, activeTab, searchTerm]);

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };
  
  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setModalOpen(true);
  };

  const handleOpenDeleteConfirm = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    if (supplierToDelete) {
      onDelete(supplierToDelete.id);
      setConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };

  const getRelatedProducts = (supplierName: string) => {
    return products.filter(p => p.supplier === supplierName);
  };
  
  const TabButton: React.FC<{ tab: SupplierTab; label: string }> = ({ tab, label }) => (
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

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة الموردين</h1>
      
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="border-b border-[var(--border-light)] dark:border-[var(--border-dark)] flex justify-between items-center">
          <nav className="-mb-px flex space-x-reverse space-x-6" aria-label="Tabs">
            <TabButton tab="local" label="الموردون المحليون" />
            <TabButton tab="foreign" label="الموردون الأجانب" />
          </nav>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center my-6 gap-4">
            <div className="relative w-full md:w-1/3">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <SearchIcon />
                </span>
                <input
                    type="text"
                    placeholder="بحث عن مورد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 text-sm text-gray-700 bg-gray-200/50 dark:bg-gray-900/50 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
            </div>
            {hasPermission('MANAGE_SUPPLIERS') && (
              <button
                  onClick={handleOpenAddModal}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]"
              >
                  <PlusIcon />
                  إضافة مورد جديد
              </button>
            )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 w-10"></th>
                <th scope="col" className="px-6 py-3">اسم المورد</th>
                <th scope="col" className="px-6 py-3">مسؤول التواصل</th>
                <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
                <th scope="col" className="px-6 py-3">العملة</th>
                <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <React.Fragment key={supplier.id}>
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">
                      <button onClick={() => toggleRow(supplier.id)} className="p-1">
                        <ChevronRightIcon className={`transition-transform ${expandedRows.has(supplier.id) ? 'rotate-90' : ''}`} />
                      </button>
                    </td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{supplier.name}</th>
                    <td className="px-6 py-4">{supplier.contactPerson}</td>
                    <td className="px-6 py-4">{supplier.email}</td>
                    <td className="px-6 py-4 font-mono text-xs">{supplier.currencyCode}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {hasPermission('MANAGE_SUPPLIERS') && <button onClick={() => handleOpenEditModal(supplier)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" aria-label={`تعديل ${supplier.name}`}><PencilIcon /></button>}
                        {hasPermission('DELETE_SUPPLIERS') && <button onClick={() => handleOpenDeleteConfirm(supplier)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" aria-label={`حذف ${supplier.name}`}><TrashIcon /></button>}
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(supplier.id) && (
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <td colSpan={6} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 mb-3"><BanknotesIcon className="w-5 h-5"/> الحسابات البنكية</h4>
                            {supplier.bankAccounts.length > 0 ? (
                                <ul className="space-y-3 text-xs">
                                    {supplier.bankAccounts.map(acc => (
                                        <li key={acc.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                            <p><strong className="font-semibold">البنك:</strong> {acc.bankName}</p>
                                            <p><strong className="font-semibold">رقم الحساب:</strong> {acc.accountNumber}</p>
                                            <p><strong className="font-semibold">IBAN:</strong> {acc.iban}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-500">لا توجد حسابات بنكية مسجلة.</p>
                            )}
                          </div>
                          <div>
                            <h4 className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 mb-3"><CubeIcon className="w-5 h-5"/> المنتجات المرتبطة</h4>
                            {getRelatedProducts(supplier.name).length > 0 ? (
                                <ul className="space-y-2 text-xs">
                                    {getRelatedProducts(supplier.name).map(p => (
                                        <li key={p.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                          <span>{p.name}</span>
                                          <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{p.code}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-500">لا توجد منتجات مرتبطة بهذا المورد.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredSuppliers.length === 0 && (
             <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                لا يوجد موردون مطابقون للمعايير.
            </p>
          )}
        </div>
      </div>
      
      {isModalOpen && (
        <SupplierModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSave={onSave}
            supplier={editingSupplier}
            currencies={currencies}
        />
      )}

      {isConfirmOpen && supplierToDelete && (
        <ConfirmationModal
            isOpen={isConfirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDelete}
            title="تأكيد الحذف"
            message={`هل أنت متأكد من رغبتك في حذف المورد "${supplierToDelete.name}"؟`}
        />
      )}
    </>
  );
};

export default SupplierManagement;
