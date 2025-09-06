import React, { useState, useEffect, useMemo } from 'react';
import type { SalesOrder, SalesOrderItem, Product, Currency, Notification, Customer, Supplier, Warehouse, ProductCategory, SystemSettings } from '../types/index';
import { TrashIcon, SearchIcon, BarcodeIcon, PlusIcon, SaveAndNewIcon, GripVerticalIcon } from './Icons';
import CustomerModal from './CustomerModal';
import ProductModal from './ProductModal';

interface SalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSalesOrder: (so: Omit<SalesOrder, 'id'> & { id?: number }) => Promise<SalesOrder>;
  salesOrder: SalesOrder | null;
  products: Product[];
  customers: Customer[];
  warehouses: Warehouse[];
  categories: ProductCategory[];
  onSaveCustomer: (customer: Omit<Customer, 'id'> & { id?: number }) => Promise<Customer>;
  onSaveProduct: (product: Omit<Product, 'id'> & { id?: number }) => Promise<Product>;
  suppliers: Supplier[];
  currency: Currency;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  systemSettings: SystemSettings;
}

const SalesOrderModal: React.FC<SalesOrderModalProps> = (props) => {
    const { isOpen, onClose, onSaveSalesOrder, salesOrder, products, customers, warehouses, categories, onSaveCustomer, onSaveProduct, suppliers, currency, addNotification, systemSettings } = props;
    
    const getDefaultState = () => ({
        customerId: 1, // Default to "عميل نقدي"
        customerName: customers.find(c => c.id === 1)?.name || 'عميل نقدي',
        orderDate: new Date().toISOString().split('T')[0],
        status: 'قيد التجهيز' as SalesOrder['status'],
        items: [] as SalesOrderItem[],
        sourceWarehouseId: (warehouses.find(w => w.type === 'رئيسي') || warehouses[0])?.id || 1,
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
    });

    const [soData, setSoData] = useState<Omit<SalesOrder, 'id' | 'soNumber'>>(getDefaultState());
    const [productSearch, setProductSearch] = useState('');
    const [barcode, setBarcode] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isNewProductModalOpen, setNewProductModalOpen] = useState(false);
    const [newProductInitialValues, setNewProductInitialValues] = useState<Partial<Omit<Product, 'id'>> | undefined>(undefined);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    useEffect(() => {
        if (salesOrder) {
            setSoData({
                customerId: salesOrder.customerId,
                customerName: salesOrder.customerName,
                orderDate: salesOrder.orderDate,
                status: salesOrder.status,
                items: salesOrder.items,
                sourceWarehouseId: salesOrder.sourceWarehouseId,
                subtotal: salesOrder.subtotal,
                taxAmount: salesOrder.taxAmount,
                totalAmount: salesOrder.totalAmount,
            });
        } else {
            resetForm();
        }
    }, [salesOrder, isOpen, customers, warehouses]);

    useEffect(() => {
        if (newProductInitialValues?.barcode) {
            const newlyAddedProduct = products.find(p => p.barcode === newProductInitialValues.barcode);
            if (newlyAddedProduct) {
                addProduct(newlyAddedProduct);
                setNewProductInitialValues(undefined);
                setBarcode('');
            }
        }
    }, [products]);

    const resetForm = () => {
        setSoData(getDefaultState());
        setProductSearch('');
        setCustomerSearch('');
        setBarcode('');
    };

    const { subtotal, taxAmount, totalAmount } = useMemo(() => {
        const subtotal = soData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const taxAmount = subtotal * (systemSettings.vatRate / 100);
        const totalAmount = subtotal + taxAmount;
        return { subtotal, taxAmount, totalAmount };
    }, [soData.items, systemSettings.vatRate]);

    const handleItemQuantityChange = (index: number, value: string) => {
        const newItems = [...soData.items];
        const item = newItems[index];
        const product = products.find(p => p.id === item.productId);
        const stockLocation = product?.stockLocations.find(sl => sl.warehouseId === soData.sourceWarehouseId);
        const availableStock = stockLocation?.quantity || 0;
        const quantity = parseInt(value, 10);
        
        if (!product) return;

        if (quantity > availableStock) {
            addNotification({ type: 'error', title: 'كمية غير متوفرة', message: `الكمية المطلوبة للمنتج "${product.name}" (${quantity}) تتجاوز المخزون المتاح في هذا المخزن (${availableStock}).` });
            item.quantity = availableStock;
        } else if (quantity < 1) {
            item.quantity = 1;
        } else {
            item.quantity = quantity;
        }
        setSoData(prev => ({ ...prev, items: newItems }));
    };

    const addProduct = (product: Product | undefined) => {
        if (!product) return;
        
        if (product.expiryDate) {
            const expiry = new Date(product.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Compare dates only
            if (expiry < today) {
                addNotification({ type: 'error', title: 'منتج منتهي الصلاحية', message: `لا يمكن بيع المنتج "${product.name}" لأنه منتهي الصلاحية بتاريخ ${product.expiryDate}.` });
                return;
            }
        }
        
        const stockLocation = product.stockLocations.find(sl => sl.warehouseId === soData.sourceWarehouseId);
        const availableStock = stockLocation?.quantity || 0;

        if (availableStock === 0) {
             addNotification({ type: 'error', title: 'نفاد المخزون', message: `المنتج "${product.name}" غير متوفر في المخزن المحدد.` });
             return;
        }
        if (soData.items.some(item => item.productId === product.id)) return;

        const newItem: SalesOrderItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: product.price,
        };
        setSoData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }

    const handleBarcodeAdd = () => {
        if (!barcode) return;
        const foundProduct = products.find(p => p.barcode === barcode);
        if (foundProduct) {
            addProduct(foundProduct);
            setBarcode('');
        } else {
            setNewProductInitialValues({ barcode });
            setNewProductModalOpen(true);
        }
    };
    
    const handleProductSearchSelect = (product: Product) => {
        addProduct(product);
        setProductSearch('');
    };

    const handleCustomerSelect = (customer: Customer) => {
        setSoData(prev => ({...prev, customerId: customer.id, customerName: customer.name}));
        setCustomerSearch('');
    };

    const handleOpenNewCustomerModal = () => {
        setCustomerModalOpen(true);
    };

    const handleSaveNewCustomer = async (customerData: Omit<Customer, 'id'> & { id?: number }) => {
        const newCustomer = await onSaveCustomer(customerData);
        setCustomerModalOpen(false);
        handleCustomerSelect(newCustomer);
    };

    const handleSaveNewProduct = async (productData: Omit<Product, 'id'> & { id?: number }) => {
        const savedProduct = await onSaveProduct(productData);
        setNewProductModalOpen(false);
        return savedProduct;
    };

    const removeItem = (index: number) => {
        setSoData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault();
    };

    const handleDrop = (targetIndex: number) => {
        if (draggedItemIndex === null) return;
        const newItems = [...soData.items];
        const [draggedItem] = newItems.splice(draggedItemIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        setSoData(prev => ({ ...prev, items: newItems }));
        setDraggedItemIndex(null);
    };

    const handleSubmit = async (andCreateNew: boolean = false) => {
        const soNumber = salesOrder?.soNumber || `SO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        await onSaveSalesOrder({
            id: salesOrder?.id,
            ...soData,
            soNumber,
            subtotal,
            taxAmount,
            totalAmount,
        });

        if (andCreateNew) {
            resetForm();
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;
    
    const productSearchResults = productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())) : [];
    const customerSearchResults = customerSearch ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())) : [];
    const availableWarehouses = warehouses.filter(w => w.type !== 'بضاعة في الطريق');

    const formatPrice = (priceValue: number) => {
        const convertedValue = priceValue * currency.rate;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(convertedValue);
    };
    
    const getStockForProductInWarehouse = (productId: number) => {
        const product = products.find(p => p.id === productId);
        const stockLocation = product?.stockLocations.find(sl => sl.warehouseId === soData.sourceWarehouseId);
        return stockLocation?.quantity || 0;
    };


    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-6xl p-6 my-8 relative transform transition-all" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {salesOrder ? `تعديل فاتورة المبيعات ${salesOrder.soNumber}` : 'فاتورة مبيعات جديدة'}
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">العميل</label>
                             <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><SearchIcon /></span>
                                <input type="text" placeholder="بحث عن عميل..." 
                                  value={customerSearch || soData.customerName}
                                  onFocus={() => setCustomerSearch(soData.customerName === 'عميل نقدي' ? '' : soData.customerName)}
                                  onChange={e => setCustomerSearch(e.target.value)} 
                                  className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
                                {customerSearch && (
                                    <div className="absolute z-20 w-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] border rounded-md mt-1 max-h-48 overflow-y-auto">
                                        {customerSearchResults.map(c => (
                                            <div key={c.id} onClick={() => handleCustomerSelect(c)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{c.name}</div>
                                        ))}
                                        {customerSearchResults.length === 0 && (
                                            <div onClick={handleOpenNewCustomerModal} className="p-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                لم يتم العثور على العميل. <span className="font-bold">إضافة عميل جديد باسم "{customerSearch}"</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">مخزن الصرف</label>
                           <select value={soData.sourceWarehouseId} onChange={e => setSoData(p => ({...p, sourceWarehouseId: parseInt(e.target.value), items: []}))} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                {availableWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">تاريخ الفاتورة</label>
                            <input type="date" value={soData.orderDate} onChange={e => setSoData(p => ({ ...p, orderDate: e.target.value }))} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)]">
                        <h3 className="text-lg font-semibold mb-2">إضافة منتجات</h3>
                        <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><SearchIcon /></span>
                                    <input type="text" placeholder="بحث بالاسم..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
                                    {productSearch && (
                                        <div className="absolute z-10 w-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] border rounded-md mt-1 max-h-48 overflow-y-auto">
                                            {productSearchResults.map(p => {
                                                const stockInWarehouse = getStockForProductInWarehouse(p.id);
                                                return (
                                                <div key={p.id} onClick={() => handleProductSearchSelect(p)} className="p-2 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                    <span>{p.name}</span>
                                                    <span className={`text-xs font-bold ${stockInWarehouse > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {stockInWarehouse > 0 ? `متوفر: ${stockInWarehouse}` : 'نفد المخزون'}
                                                    </span>
                                                </div>
                                            )})}
                                            {productSearchResults.length === 0 && <div className="p-2 text-gray-500">لا توجد نتائج.</div>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><BarcodeIcon className="w-5 h-5"/></span>
                                      <input type="text" placeholder="إضافة بالباركود..." value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBarcodeAdd()} className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
                                    </div>
                                </div>
                            </div>
                    </div>

                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-right">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-2 py-2 w-10"></th><th className="px-4 py-2">المنتج</th><th className="px-4 py-2 w-24">الكمية</th><th className="px-4 py-2 w-32">السعر</th><th className="px-4 py-2 w-32">الإجمالي</th><th className="px-4 py-2 w-16"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {soData.items.map((item, index) => (
                                    <tr 
                                        key={item.productId} 
                                        className={`border-b dark:border-gray-700 ${draggedItemIndex === index ? 'opacity-50' : ''}`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(index)}
                                        onDragEnd={() => setDraggedItemIndex(null)}
                                    >
                                        <td className="px-2 py-2 text-center cursor-move text-gray-400"><GripVerticalIcon/></td>
                                        <td className="px-4 py-2 font-medium">{item.productName}</td>
                                        <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={e => handleItemQuantityChange(index, e.target.value)} className="w-full p-1 bg-gray-100 dark:bg-gray-800 rounded" min="1" max={getStockForProductInWarehouse(item.productId)} /></td>
                                        <td className="px-4 py-2">{formatPrice(item.price)}</td>
                                        <td className="px-4 py-2">{formatPrice(item.quantity * item.price)}</td>
                                        <td className="px-4 py-2 text-center"><button type="button" onClick={() => removeItem(index)} className="p-1 text-red-500"><TrashIcon /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {soData.items.length === 0 && <p className="text-center text-gray-500 py-4">لم تتم إضافة أي منتجات.</p>}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <div className="w-full md:w-1/3 space-y-2">
                             <div className="flex justify-between">
                                <span>المجموع الفرعي:</span>
                                <span className="font-semibold">{formatPrice(subtotal)}</span>
                             </div>
                             <div className="flex justify-between">
                                <span>الضريبة ({systemSettings.vatRate}%):</span>
                                <span className="font-semibold">{formatPrice(taxAmount)}</span>
                             </div>
                             <div className="flex justify-between font-bold text-xl pt-2 border-t">
                                <span>الإجمالي النهائي:</span>
                                <span>{formatPrice(totalAmount)}</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">حفظ الفاتورة</button>
                        <button type="button" onClick={() => handleSubmit(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-green)] text-white rounded-lg">
                            <SaveAndNewIcon />
                            حفظ وإنشاء جديد
                        </button>
                    </div>
                </form>
            </div>
        </div>
        {isCustomerModalOpen && (
            <CustomerModal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} onSave={handleSaveNewCustomer} customer={null} initialName={customerSearch} />
        )}
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

export default SalesOrderModal;
