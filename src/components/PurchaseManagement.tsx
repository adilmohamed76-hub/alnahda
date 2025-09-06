import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for type definitions
import type { PurchaseOrder, Product, Supplier, Currency, Notification, Warehouse, ProductCategory, Permission, Account } from '../types/index';
// FIX: Import SortAscIcon and SortDescIcon
import { PlusIcon, SearchIcon, PencilIcon, LightbulbIcon, SortAscIcon, SortDescIcon } from './Icons';
import PurchaseOrderModal from './PurchaseOrderModal';


interface PurchaseManagementProps {
    purchaseOrders: PurchaseOrder[];
    products: Product[];
    suppliers: Supplier[];
    warehouses: Warehouse[];
    categories: ProductCategory[];
    accounts: Account[];
    onSavePurchaseOrder: (po: Omit<PurchaseOrder, 'id'> & { id?: number }) => void;
    onUpdateStatus: (poId: number, status: PurchaseOrder['status']) => void;
    onSaveProduct: (product: Omit<Product, 'id'> & { id?: number }) => Promise<Product>;
    currency: Currency;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    hasPermission: (permission: Permission) => boolean;
    onCreateFeasibilityStudy: (source: PurchaseOrder) => void;
}

type SortKey = keyof PurchaseOrder;

const PurchaseManagement: React.FC<PurchaseManagementProps> = (props) => {
    const { purchaseOrders, products, currency, onUpdateStatus, hasPermission, onCreateFeasibilityStudy } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

    const filteredPOs = useMemo(() => {
        return purchaseOrders.filter(po =>
            po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [purchaseOrders, searchTerm]);

    const sortedPOs = useMemo(() => {
        let sortableItems = [...filteredPOs];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredPOs, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenAddModal = () => {
        setEditingPO(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (po: PurchaseOrder) => {
        setEditingPO(po);
        setModalOpen(true);
    };

    const formatPrice = (priceValue: number) => {
        const totalExpenses = (editingPO?.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
        const convertedValue = (priceValue + totalExpenses) * currency.rate;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(convertedValue);
    };

    const getStatusChip = (status: PurchaseOrder['status']) => {
        const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full';
        switch (status) {
            case 'مسودة': return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
            case 'تم الطلب': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
            case 'تم الاستلام': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
            case 'ملغي': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
        }
    };

    const SortIndicator: React.FC<{ columnKey: SortKey }> = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة المشتريات</h1>
            <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-1/3">
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><SearchIcon /></span>
                        <input
                            type="text"
                            placeholder="بحث (رقم الطلب, المورد...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 text-sm text-gray-700 bg-gray-200/50 dark:bg-gray-900/50 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        />
                    </div>
                    {hasPermission('CREATE_PURCHASE_ORDERS') && (
                        <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
                            <PlusIcon />
                            إنشاء أمر شراء
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">رقم الطلب</th>
                                <th scope="col" className="px-6 py-3">المورد</th>
                                <th scope="col" className="px-6 py-3">التاريخ</th>
                                <th scope="col" className="px-6 py-3">الإجمالي</th>
                                <th scope="col" className="px-6 py-3">الحالة</th>
                                <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPOs.map((po) => (
                                <tr key={po.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-mono text-xs">{po.poNumber}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{po.supplierName}</th>
                                    <td className="px-6 py-4">{po.orderDate}</td>
                                    <td className="px-6 py-4">{formatPrice(po.totalAmount)}</td>
                                    <td className="px-6 py-4"><span className={getStatusChip(po.status)}>{po.status}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            {hasPermission('MANAGE_PURCHASE_ORDERS') && 
                                              <>
                                                <button onClick={() => handleOpenEditModal(po)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" aria-label={`تعديل أمر الشراء ${po.poNumber}`}><PencilIcon /></button>
                                                {po.status === 'تم الاستلام' && hasPermission('CREATE_FEASIBILITY_STUDIES') && (
                                                    <button onClick={() => onCreateFeasibilityStudy(po)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-full" aria-label={`إنشاء دراسة جدوى من أمر الشراء ${po.poNumber}`}>
                                                        <LightbulbIcon />
                                                    </button>
                                                )}
                                              </>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sortedPOs.length === 0 && (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد أوامر شراء مطابقة.</p>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <PurchaseOrderModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    purchaseOrder={editingPO}
                    products={products}
                    {...props}
                />
            )}
        </>
    );
};

export default PurchaseManagement;