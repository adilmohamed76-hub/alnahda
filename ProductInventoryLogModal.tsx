import React from 'react';
import type { Product, InventoryLog, Warehouse } from './types';
import { TrendingUpIcon, TrendingDownIcon, PencilIcon, SwitchHorizontalIcon } from './Icons';

interface ProductInventoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  logs: InventoryLog[];
  warehouses: Warehouse[];
}

const ProductInventoryLogModal: React.FC<ProductInventoryLogModalProps> = ({ isOpen, onClose, product, logs, warehouses }) => {
    if (!isOpen || !product) return null;

    const getWarehouseName = (id: number) => warehouses.find(w => w.id === id)?.name || 'غير معروف';

    const getTypeIcon = (type: InventoryLog['type']) => {
        switch(type) {
            case 'شراء': return <TrendingUpIcon className="w-5 h-5 text-green-500" />;
            case 'بيع': return <TrendingDownIcon className="w-5 h-5 text-red-500" />;
            case 'تعديل يدوي': return <PencilIcon className="w-5 h-5 text-yellow-500" />;
            case 'تحويل داخلي': return <TrendingUpIcon className="w-5 h-5 text-blue-500" />;
            case 'تحويل خارجي': return <TrendingDownIcon className="w-5 h-5 text-purple-500" />;
            default: return null;
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-5xl p-6 my-8 relative transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    سجل حركة الصنف: {product.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-6 font-mono">
                    {product.code}
                </p>

                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">التاريخ والوقت</th>
                                <th className="px-4 py-3">العملية</th>
                                <th className="px-4 py-3">المخزن</th>
                                <th className="px-4 py-3">الكمية</th>
                                <th className="px-4 py-3">الرصيد في المخزن</th>
                                <th className="px-4 py-3">المرجع</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-light)] dark:divide-[var(--border-dark)]">
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(log.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(log.type)}
                                            <span>{log.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{getWarehouseName(log.warehouseId)}</td>
                                    <td className={`px-4 py-3 font-bold ${log.quantityChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{log.newStock}</td>
                                    <td className="px-4 py-3">{log.reference}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد حركات مسجلة لهذا المنتج.</p>}
                </div>

                <div className="flex justify-end pt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductInventoryLogModal;