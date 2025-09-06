


import React, { useState, useEffect, useMemo } from 'react';
import type { PurchaseOrder, PurchaseOrderItem, Product, Supplier, Currency, Warehouse, ProductCategory, PurchaseOrderExpense, Account } from './types';
import ProductModal from './ProductModal';
import { TrashIcon, SearchIcon, BarcodeIcon, PlusIcon, GripVerticalIcon } from './Icons';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePurchaseOrder: (po: Omit<PurchaseOrder, 'id'> & { id?: number }) => void;
  purchaseOrder: PurchaseOrder | null;
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  categories: ProductCategory[];
  accounts: Account[];
  onSaveProduct: (product: Omit<Product, 'id'> & { id?: number }) => Promise<Product>;
  currency: Currency;
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = (props) => {
    const { isOpen, onClose, onSavePurchaseOrder, purchaseOrder, products, suppliers, warehouses, categories, accounts, onSaveProduct, currency } = props;
    const [poData, setPoData] = useState<Omit<PurchaseOrder, 'id' | 'poNumber' | 'totalAmount'>>({
        supplierId: 0,
        supplierName: '',
        orderDate: new Date().toISOString().split('T')[0],
        status: 'مسودة',
        items: [],
        expenses: [],
        destinationWarehouseId: 1,
    });
    const [productSearch, setProductSearch] = useState('');
    const [barcode, setBarcode] = useState('');
    const [isNewProductModalOpen, setNewProductModalOpen] = useState(false);
    const [newProductInitialValues, setNewProductInitialValues] = useState<Partial<Omit<Product, 'id'>> | undefined>(undefined);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    
    const formatPrice = (priceValue: number) => {
        const convertedValue = priceValue * currency.rate;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(convertedValue);
    };

    useEffect(() => {
        if (purchaseOrder) {
            setPoData({ ...purchaseOrder, expenses: purchaseOrder.expenses || [] });
        } else if (suppliers.length > 0) {
            const mainWarehouse = warehouses.find(w => w.type === 'رئيسي') || warehouses[0];
            setPoData({
                supplierId: suppliers[0].id,
                supplierName: suppliers[0].name,
                orderDate: new Date().toISOString().split('T')[0],
                status: 'مسودة',
                items: [],
                expenses: [],
                destinationWarehouseId: mainWarehouse?.id || 1,
            });
        }
    }, [purchaseOrder, suppliers, warehouses, isOpen]);

    useEffect(() => {
        if (newProductInitialValues?.barcode || newProductInitialValues?.name) {
            const newlyAddedProduct = products.find(p => 
                (newProductInitialValues.barcode && p.barcode === newProductInitialValues.barcode) ||
                (newProductInitialValues.name && p.name === newProductInitialValues.name)
            );
            if (newlyAddedProduct) {
                addProductToOrder(newlyAddedProduct);
                setNewProductInitialValues(undefined); // Reset
            }
        }
    }, [products]);

    const { totalItemsAmount, totalExpensesAmount, grandTotal } = useMemo(() => {
        const totalItemsAmount = poData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const totalExpensesAmount = (poData.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
        const grandTotal = totalItemsAmount + totalExpensesAmount;
        return { totalItemsAmount, totalExpensesAmount, grandTotal };
    }, [poData.items, poData.expenses]);


    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const supplierId = parseInt(e.target.value, 10);
        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier) {
            setPoData(prev => ({ ...prev, supplierId: supplier.id, supplierName: supplier.name }));
        }
    };

    const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
        const newItems = [...poData.items];
        if (field === 'quantity' || field === 'price' || field === 'newSellingPrice') {
             if (Number(value) < 0) return;
        }
        (newItems[index] as any)[field] = value;
        setPoData(prev => ({ ...prev, items: newItems }));
    };

    const addProductToOrder = (product: Product) => {
        if (poData.items.some(item => item.productId === product.id)) {
            return;
        }
        const newItem: PurchaseOrderItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: product.costPrice,
            newSellingPrice: product.price,
            expiryDate: '',
        };
        setPoData(prev => ({ ...prev, items: [...prev.items, newItem] }));
        setProductSearch('');
    };

    const removeItem = (index: number) => {
        setPoData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleBarcodeAdd = () => {
        if (!barcode) return;
        const foundProduct = products.find(p => p.barcode === barcode);
        if (foundProduct) {
            addProductToOrder(foundProduct);
            setBarcode('');
        } else {
            setNewProductInitialValues({ barcode, supplier: poData.supplierName });
            setNewProductModalOpen(true);
        }
    };
    
    const handleCreateNewFromSearch = () => {
        if (!productSearch) return;
        setNewProductInitialValues({ name: productSearch, supplier: poData.supplierName });
        setNewProductModalOpen(true);
        setProductSearch('');
    };

    const handleSaveNewProduct = async (productData: Omit<Product, 'id'> & { id?: number }) => {
        const savedProduct = await onSaveProduct(productData);
        setNewProductModalOpen(false);
        return savedProduct;
    };
    
    const handleExpenseChange = (index: number, field: keyof PurchaseOrderExpense, value: string | number) => {
        const newExpenses = [...(poData.expenses || [])];
        (newExpenses[index] as any)[field] = field === 'amount' ? parseFloat(value as string) || 0 : value;
        setPoData(prev => ({ ...prev, expenses: newExpenses }));
    };
    
    const addExpense = () => {
        const newExpense: PurchaseOrderExpense = { description: '', amount: 0 };
        setPoData(prev => ({ ...prev, expenses: [...(prev.expenses || []), newExpense] }));
    };
    
    const removeExpense = (index: number) => {
        setPoData(prev => ({ ...prev, expenses: (prev.expenses || []).filter((_, i) => i !== index) }));
    };

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault();
    };

    const handleDrop = (targetIndex: number) => {
        if (draggedItemIndex === null) return;
        const newItems = [...poData.items];
        const [draggedItem] = newItems.splice(draggedItemIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        setPoData(prev => ({ ...prev, items: newItems }));
        setDraggedItemIndex(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const poNumber = purchaseOrder?.poNumber || `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        
        // Calculate final cost prices for items before saving
        const finalItems = poData.items.map(item => {
            const itemValue = item.price * item.quantity;
            const allocatedExpense = totalItemsAmount > 0 ? (itemValue / totalItemsAmount) * totalExpensesAmount : 0;
            const finalCostPrice = item.quantity > 0 ? item.price + (allocatedExpense / item.quantity) : item.price;
            return { ...item, finalCostPrice };
        });

        onSavePurchaseOrder({
            id: purchaseOrder?.id,
            ...poData,
            items: finalItems,
            poNumber,
            totalAmount: totalItemsAmount, // The base total without expenses
        });
        onClose();
    };

    if (!isOpen) return null;
    
    const searchResults = productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())) : [];
    const availableWarehouses = warehouses.filter(w => w.type !== 'بضاعة في الطريق');

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-6xl p-6 my-8 relative transform transition-all" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {purchaseOrder ? `تعديل أمر الشراء ${purchaseOrder.poNumber}` : 'إنشاء أمر شراء جديد'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">المورد</label>
                                <select value={poData.supplierId} onChange={handleSupplierChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">تاريخ الطلب</label>
                                <input type="date" value={poData.orderDate} onChange={e => setPoData(p => ({ ...p, orderDate: e.target.value }))} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">المخزن المستلم</label>
                                <select value={poData.destinationWarehouseId} onChange={e => setPoData(p => ({...p, destinationWarehouseId: parseInt(e.target.value)}))} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                    {availableWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Add Products Section */}
                        <div className="pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)]">
                            <h3 className="text-lg font-semibold mb-2">إضافة منتجات</h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><SearchIcon /></span>
                                    <input type="text" placeholder="بحث بالاسم..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
                                    <div className="absolute z-10 w-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] border rounded-md mt-1 max-h-40 overflow-y-auto">
                                        {searchResults.map(p => (
                                            <div key={p.id} onClick={() => addProductToOrder(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{p.name}</div>
                                        ))}
                                        {productSearch && searchResults.length === 0 && (
                                            <div onClick={handleCreateNewFromSearch} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-blue-500">
                                                لم يتم العثور على المنتج. <span className="font-bold">إنشاء منتج جديد باسم: "{productSearch}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><BarcodeIcon className="w-5 h-5"/></span>
                                      <input type="text" placeholder="إضافة بالباركود..." value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBarcodeAdd()} className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
                                    </div>
                                    <button type="button" onClick={handleBarcodeAdd} className="px-4 bg-[var(--primary-color)] text-white rounded-md"><PlusIcon/></button>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm text-right">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-2 py-2 w-10"></th>
                                        <th className="px-4 py-2">المنتج</th>
                                        <th className="px-4 py-2 w-24">الكمية</th>
                                        <th className="px-4 py-2 w-32">سعر التكلفة</th>
                                        <th className="px-4 py-2 w-32">التكلفة النهائية للقطعة</th>
                                        <th className="px-4 py-2 w-32">سعر البيع الجديد</th>
                                        <th className="px-4 py-2 w-32">الإجمالي</th>
                                        <th className="px-4 py-2 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {poData.items.map((item, index) => {
                                      const itemValue = item.price * item.quantity;
                                      const allocatedExpense = totalItemsAmount > 0 ? (itemValue / totalItemsAmount) * totalExpensesAmount : 0;
                                      const finalCostPerItem = item.quantity > 0 ? item.price + (allocatedExpense / item.quantity) : item.price;
                                      
                                      return (
                                        <tr 
                                            key={item.productId} 
                                            className={`border-b dark:border-gray-700 ${draggedItemIndex === index ? 'opacity-50' : ''}`}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(index)}
                                            onDragEnd={() => setDraggedItemIndex(null)}
                                        >
                                            <td className="px-2 py-2 text-center cursor-move text-gray-400">
                                                <GripVerticalIcon />
                                            </td>
                                            <td className="px-4 py-2 font-medium">{item.productName}</td>
                                            <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} className="w-full p-1 bg-gray-100 dark:bg-gray-800 rounded" /></td>
                                            <td className="px-4 py-2"><input type="number" step="0.01" value={item.price} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))} className="w-full p-1 bg-gray-100 dark:bg-gray-800 rounded" /></td>
                                            <td className="px-4 py-2 font-semibold bg-blue-50 dark:bg-blue-900/20">{formatPrice(finalCostPerItem)}</td>
                                            <td className="px-4 py-2"><input type="number" step="0.01" value={item.newSellingPrice ?? ''} onChange={e => handleItemChange(index, 'newSellingPrice', parseFloat(e.target.value))} className="w-full p-1 bg-gray-100 dark:bg-gray-800 rounded" /></td>
                                            <td className="px-4 py-2">{formatPrice(itemValue)}</td>
                                            <td className="px-4 py-2 text-center"><button type="button" onClick={() => removeItem(index)} className="p-1 text-red-500"><TrashIcon /></button></td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                            {poData.items.length === 0 && <p className="text-center text-gray-500 py-4">لم تتم إضافة أي منتجات.</p>}
                        </div>

                        {/* Expenses Section */}
                        <div className="pt-4 mt-4 border-t">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">المصاريف الإضافية</h3>
                                <button type="button" onClick={addExpense} className="flex items-center gap-1 text-sm text-[var(--primary-color)] hover:underline">
                                    <PlusIcon className="w-4 h-4" /> إضافة مصروف
                                </button>
                            </div>
                            <div className="space-y-2">
                                {(poData.expenses || []).map((exp, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" placeholder="وصف المصروف (مثال: شحن)" value={exp.description} onChange={e => handleExpenseChange(index, 'description', e.target.value)} className="w-full p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm" />
                                        <input type="number" step="0.01" placeholder="المبلغ" value={exp.amount || ''} onChange={e => handleExpenseChange(index, 'amount', e.target.value)} className="w-48 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm" />
                                        <button type="button" onClick={() => removeExpense(index)} className="p-1 text-red-500"><TrashIcon /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center font-bold text-lg pt-4 mt-4 border-t">
                            <div>إجمالي الأصناف: <span className="block">{formatPrice(totalItemsAmount)}</span></div>
                            <div>إجمالي المصاريف: <span className="block">{formatPrice(totalExpensesAmount)}</span></div>
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">الإجمالي النهائي: <span className="block">{formatPrice(grandTotal)}</span></div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
                            <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">حفظ أمر الشراء</button>
                        </div>
                    </form>
                </div>
            </div>
            {isNewProductModalOpen && (
                <ProductModal
                    isOpen={isNewProductModalOpen}
                    onClose={() => setNewProductModalOpen(false)}
                    onSave={handleSaveNewProduct}
                    product={null}
                    initialValues={newProductInitialValues}
                    currency={currency}
                    suppliers={suppliers}
                    warehouses={warehouses}
                    categories={categories}
                    products={products}
                />
            )}
        </>
    );
};

export default PurchaseOrderModal;