import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for type definitions
import type { Customer, CustomerType, Permission } from './types/index';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from './Icons';
import CustomerModal from './CustomerModal';
import ConfirmationModal from './ConfirmationModal';

interface CustomerManagementProps {
  customers: Customer[];
  onSave: (customer: Omit<Customer, 'id'> & { id?: number }) => Promise<Customer>;
  onDelete: (customerId: number) => void;
  hasPermission: (permission: Permission) => boolean;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onSave, onDelete, hasPermission }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    // Exclude "Cash Customer" from the main list view
    return customers.filter(c => 
      c.id !== 1 &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleOpenDeleteConfirm = (customer: Customer) => {
    setCustomerToDelete(customer);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    if (customerToDelete) {
      onDelete(customerToDelete.id);
      setConfirmOpen(false);
      setCustomerToDelete(null);
    }
  };
  
  const handleSave = async (customerData: Omit<Customer, 'id'> & { id?: number }) => {
      await onSave(customerData);
      setModalOpen(false);
  };

  const getTypeChip = (type: CustomerType) => {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (type) {
      case 'مميز': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
      case 'جهة اعتبارية': return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
      default: return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة العملاء</h1>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-1/3">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><SearchIcon /></span>
                <input
                    type="text"
                    placeholder="بحث عن عميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 text-sm text-gray-700 bg-gray-200/50 dark:bg-gray-900/50 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
            </div>
            {hasPermission('MANAGE_CUSTOMERS') && (
              <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
                  <PlusIcon />
                  إضافة عميل جديد
              </button>
            )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">اسم العميل</th>
                <th scope="col" className="px-6 py-3">التصنيف</th>
                <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
                <th scope="col" className="px-6 py-3">الهاتف</th>
                <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{customer.name}</th>
                  <td className="px-6 py-4"><span className={getTypeChip(customer.type)}>{customer.type}</span></td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      {hasPermission('MANAGE_CUSTOMERS') && <button onClick={() => handleOpenEditModal(customer)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"><PencilIcon /></button>}
                      {hasPermission('DELETE_CUSTOMERS') && <button onClick={() => handleOpenDeleteConfirm(customer)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">لا يوجد عملاء مطابقون.</p>
          )}
        </div>
      </div>
      {isModalOpen && (
        <CustomerModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} customer={editingCustomer} />
      )}
      {isConfirmOpen && customerToDelete && (
        <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="تأكيد الحذف" message={`هل أنت متأكد من رغبتك في حذف العميل "${customerToDelete.name}"؟`} />
      )}
    </>
  );
};

export default CustomerManagement;