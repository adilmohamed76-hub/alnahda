


import React, { useState, useMemo, useEffect } from 'react';
import type { SalesOrder, Product, Currency, Notification, Customer, Supplier, Warehouse, ProductCategory, Permission, SystemSettings } from './types';
import { PlusIcon, SearchIcon, PencilIcon, SortAscIcon, SortDescIcon, PrinterIcon } from './Icons';
import SalesOrderModal from './SalesOrderModal';
import SalesInvoiceToPrint from './SalesInvoiceToPrint';

interface SalesManagementProps {
    salesOrders: SalesOrder[];
    products: Product[];
    customers: Customer[];
    warehouses: Warehouse[];
    categories: ProductCategory[];
    onSaveSalesOrder: (so: Omit<SalesOrder, 'id'> & { id?: number }) => Promise<SalesOrder>;
    onUpdateStatus: (soId: number, status: SalesOrder['status']) => void;
    onSaveCustomer: (customer: Omit<Customer, 'id'> & { id?: number }) => Promise<Customer>;
    onSaveProduct: (product: Omit<Product, 'id'> & { id?: number }) => Promise<Product>;
    suppliers: Supplier[];
    currency: Currency;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    hasPermission: (permission: Permission) => boolean;
    systemSettings: SystemSettings;
}

type SortKey = keyof SalesOrder;

const SalesManagement: React.FC<SalesManagementProps> = (props) => {
    const { salesOrders, products, customers, currency, onUpdateStatus, hasPermission, systemSettings } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingSO, setEditingSO] = useState<SalesOrder | null>(null);
    const [invoiceToPrint, setInvoiceToPrint] = useState<SalesOrder | null>(null);

    useEffect(() => {
        if (invoiceToPrint) {
            const timer = setTimeout(() => {
                window.print();
                setInvoiceToPrint(null);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [invoiceToPrint]);

    const filteredSOs = useMemo(() => {
        return salesOrders.filter(so =>
            so.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            so.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            so.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [salesOrders, searchTerm]);

    const sortedSOs = useMemo(() => {
        let sortableItems = [...filteredSOs];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [filteredSOs, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenAddModal = () => {
        setEditingSO(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (so: SalesOrder) => {
        setEditingSO(so);
        setModalOpen(true);
    };

    const formatPrice = (priceValue: number, isReturn: boolean) => {
        const displayValue = isReturn ? -priceValue : priceValue;
        const convertedValue = displayValue * currency.rate;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(convertedValue);
    };

    const getStatusChip = (status: SalesOrder['status']) => {
        const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full';
        switch (status) {
            case 'قيد التجهيز': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
            case 'تم الشحن': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
            case 'مكتمل': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
            case 'ملغي': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
        }
    };

    const SortIndicator: React.FC<{ columnKey: SortKey }> = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
    };

    return (
        <>
            <div className="no-print">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة المبيعات</h1>
                <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full md:w-1/3">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><SearchIcon /></span>
                            <input
                                type="text"
                                placeholder="بحث (رقم الفاتورة, العميل...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 text-sm text-gray-700 bg-gray-200/50 dark:bg-gray-900/50 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            />
                        </div>
                        {hasPermission('CREATE_SALES_ORDERS') && (
                            <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
                                <PlusIcon />
                                إنشاء فاتورة مبيعات
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('soNumber')} className="flex items-center gap-1">رقم الفاتورة <SortIndicator columnKey="soNumber" /></button></th>
                                    <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('customerName')} className="flex items-center gap-1">العميل <SortIndicator columnKey="customerName" /></button></th>
                                    <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('orderDate')} className="flex items-center gap-1">التاريخ <SortIndicator columnKey="orderDate" /></button></th>
                                    <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('totalAmount')} className="flex items-center gap-1">الإجمالي <SortIndicator columnKey="totalAmount" /></button></th>
                                    <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('status')} className="flex items-center gap-1">الحالة <SortIndicator columnKey="status" /></button></th>
                                    <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSOs.map((so) => {
                                    const isReturn = so.type === 'Return';
                                    return (
                                        <tr key={so.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${isReturn ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}>
                                            <td className="px-6 py-4 font-mono text-xs">{so.soNumber} {isReturn && <span className="text-red-500 font-bold">(مرتجع)</span>}</td>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{so.customerName}</th>
                                            <td className="px-6 py-4">{so.orderDate}</td>
                                            <td className={`px-6 py-4 font-semibold ${isReturn ? 'text-red-600' : 'text-green-600'}`}>{formatPrice(so.totalAmount, isReturn)}</td>
                                            <td className="px-6 py-4"><span className={getStatusChip(so.status)}>{so.status}</span></td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                  <button onClick={() => setInvoiceToPrint(so)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded-full" aria-label={`طباعة الفاتورة ${so.soNumber}`}>
                                                      <PrinterIcon />
                                                  </button>
                                                  {hasPermission('MANAGE_SALES_ORDERS') && (
                                                    <>
                                                      <button onClick={() => handleOpenEditModal(so)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" aria-label={`تعديل الفاتورة ${so.soNumber}`}><PencilIcon /></button>
                                                      <select 
                                                        value={so.status} 
                                                        onChange={(e) => onUpdateStatus(so.id, e.target.value as SalesOrder['status'])}
                                                        className="text-xs bg-gray-100 dark:bg-gray-700 border-none rounded-md focus:ring-1 focus:ring-[var(--primary-color)]"
                                                      >
                                                        <option value="قيد التجهيز">قيد التجهيز</option>
                                                        <option value="تم الشحن">تم الشحن</option>
                                                        <option value="مكتمل">مكتمل</option>
                                                        <option value="ملغي">ملغي</option>
                                                      </select>
                                                    </>
                                                  )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {sortedSOs.length === 0 && (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد فواتير مبيعات مطابقة.</p>
                        )}
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <SalesOrderModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    salesOrder={editingSO}
                    products={products}
                    {...props}
                />
            )}
            {invoiceToPrint && (
                <SalesInvoiceToPrint
                    invoice={invoiceToPrint}
                    currency={currency}
                    customer={customers.find(c => c.id === invoiceToPrint.customerId) || null}
                    settings={systemSettings}
                />
            )}
        </>
    );
};

export default SalesManagement;