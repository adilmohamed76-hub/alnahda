import React, { useState, useEffect, useMemo } from 'react';
import type { InventoryTransfer, Product, Warehouse, Notification } from './types';
import { TrashIcon, SearchIcon } from './Icons';

interface InventoryTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transfer: Omit<InventoryTransfer, 'id'>) => void;
  products: Product[];
  warehouses: Warehouse[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

const InventoryTransferModal: React.FC<InventoryTransferModalProps> = ({ isOpen, onClose, onSave, products, warehouses, addNotification }) => {
    const [fromWarehouseId, setFromWarehouseId] = useState<number | ''>('');
    const [toWarehouseId, setToWarehouseId] = useState<number | ''>('');
    const [items, setItems] = useState<{ productId: number; productName: string; quantity: number; available: number }[]>([]);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            const main = warehouses.find(w => w.type === 'رئيسي');
            const branch = warehouses.find(w => w.type === 'فرعي');
            setFromWarehouseId(main?.id || (warehouses.length > 0 ? warehouses[0].id : ''));
            setToWarehouseId(branch?.id || (warehouses.length > 1 ? warehouses[1].id : ''));
            setItems([]);
            setProductSearch('');
        }
    }, [isOpen, warehouses]);
    
    const availableFromWarehouses = warehouses.filter(w => w.type !== 'بضاعة في الطريق');
    const availableToWarehouses = warehouses.filter(w => w.id !== fromWarehouseId);
    
    const productsInFromWarehouse = useMemo(() => {
        if (!fromWarehouseId) return [];
        return products
            .map(p => ({
                product: p,
                stockLocation: p.stockLocations.find(sl => sl.warehouseId === fromWarehouseId),
            }))
            .filter(item => item.stockLocation && item.stockLocation.quantity > 0)
            .map(item => ({
                ...item.product,
                availableStock: item.stockLocation!.quantity,
            }));
    }, [products, fromWarehouseId]);
    
    const searchResults = productSearch ? productsInFromWarehouse.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())) : [];

    const handleAddProduct = (product: typeof productsInFromWarehouse[0]) => {
        if (items.some(i => i.productId === product.id)) return;
        setItems(prev => [...prev, { productId: product.id, productName: product.name, quantity: 1, available: product.availableStock }]);
        setProductSearch('');
    };

    const handleQuantityChange = (productId: number, quantity: string) => {
        const numQuantity = parseInt(quantity, 10);
        setItems(prev => prev.map(item => {
            if (item.productId === productId) {
                if (numQuantity > item.available) {
                    addNotification({ type: 'error', title: 'كمية غير كافية', message: `الكمية المتاحة لـ ${item.productName} هي ${item.available} فقط.` });
                    return { ...item, quantity: item.available };
                }
                return { ...item, quantity: numQuantity > 0 ? numQuantity : 1 };
            }
            return item;
        }));
    };

    const handleRemoveItem = (productId: number) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    };

    const handleSubmit = () => {
        if (!fromWarehouseId || !toWarehouseId || items.length === 0) {
            addNotification({ type: 'error', title: 'بيانات ناقصة', message: 'الرجاء تحديد المخازن وإضافة منتجات للتحويل.' });
            return;
        }
        if (fromWarehouseId === toWarehouseId) {
             addNotification({ type: 'error', title: 'خطأ', message: 'لا يمكن التحويل من وإلى نفس المخزن.' });
            return;
        }
        const transfer: Omit<InventoryTransfer, 'id'> = {
            reference: `TR-${Date.now()}`,
            fromWarehouseId,
            toWarehouseId,
            items: items.map(({ productId, productName, quantity }) => ({ productId, productName, quantity })),
            date: new Date().toISOString(),
        };
        onSave(transfer);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-4xl p-6 my-8" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">إنشاء تحويل مخزني</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">من مخزن</label>
                        <select value={fromWarehouseId} onChange={e => { setFromWarehouseId(Number(e.target.value)); setItems([]); }} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                            <option value="" disabled>اختر مخزن المصدر</option>
                            {availableFromWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">إلى مخزن</label>
                        <select value={toWarehouseId} onChange={e => setToWarehouseId(Number(e.target.value))} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" disabled={!fromWarehouseId}>
                           <option value="" disabled>اختر مخزن الوجهة</option>
                           {availableToWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="relative mb-4">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><SearchIcon /></span>
                    <input
                        type="text"
                        placeholder="ابحث عن منتج لإضافته..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md"
                        disabled={!fromWarehouseId}
                    />
                    {productSearch && (
                        <div className="absolute z-10 w-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] border rounded-md mt-1 max-h-40 overflow-y-auto">
                            {searchResults.map(p => (
                                <div key={p.id} onClick={() => handleAddProduct(p)} className="p-2 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                  <span>{p.name}</span>
                                  <span className="text-xs text-green-500">متوفر: {p.availableStock}</span>
                                </div>
                            ))}
                             {searchResults.length === 0 && <div className="p-2 text-gray-500">لا توجد نتائج.</div>}
                        </div>
                    )}
                </div>

                <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                            <tr><th className="px-4 py-2 text-right">المنتج</th><th className="px-4 py-2 text-right w-32">الكمية</th><th className="px-4 py-2 w-16"></th></tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.productId} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2">{item.productName}</td>
                                    <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.productId, e.target.value)} className="w-full p-1 bg-gray-100 dark:bg-gray-800 rounded" min="1" max={item.available} /></td>
                                    <td className="px-4 py-2"><button onClick={() => handleRemoveItem(item.productId)} className="p-1 text-red-500"><TrashIcon /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && <p className="text-center py-4 text-gray-500">لم تتم إضافة أي منتجات للتحويل.</p>}
                </div>
                
                <div className="flex justify-end gap-4 pt-6 mt-4 border-t">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">تأكيد التحويل</button>
                </div>
            </div>
        </div>
    );
};

export default InventoryTransferModal;
