
import React, { useState, useMemo } from 'react';
import type { Product, Currency, Notification, Supplier, Warehouse, ProductCategory, Permission } from './types';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, SortAscIcon, SortDescIcon, PrinterIcon, UploadIcon, DownloadIcon, ChevronRightIcon, BarcodeIcon } from './Icons';
import ProductModal from './ProductModal';
import ConfirmationModal from './ConfirmationModal';
import BarcodePrintModal from './BarcodePrintModal';

type SortKey = keyof Product | 'totalStock' | 'categoryName';

interface ProductManagementProps {
    currency: Currency;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    products: Product[];
    suppliers: Supplier[];
    warehouses: Warehouse[];
    categories: ProductCategory[];
    onSaveProduct: (product: Omit<Product, 'id'> & { id?: number }) => Promise<Product>;
    onDeleteProduct: (productId: number) => void;
    hasPermission: (permission: Permission) => boolean;
    onPrintBarcodes: (product: Product, quantity: number) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ currency, addNotification, products, suppliers, warehouses, categories, onSaveProduct, onDeleteProduct, hasPermission, onPrintBarcodes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const [isPrintModalOpen, setPrintModalOpen] = useState(false);
  const [productToPrint, setProductToPrint] = useState<Product | null>(null);
  
  const getCategoryName = (categoryId: number) => categories.find(c => c.id === categoryId)?.name || 'غير مصنف';

  const productsWithDetails = useMemo(() => {
    return products.map(p => ({
        ...p,
        totalStock: p.stockLocations.reduce((sum, loc) => sum + loc.quantity, 0),
        categoryName: getCategoryName(p.categoryId),
    }));
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    return productsWithDetails.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productsWithDetails, searchTerm]);

  const sortedProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);
  
  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };
  
  const getWarehouseName = (id: number) => warehouses.find(w => w.id === id)?.name || 'غير معروف';

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };
  
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };
  
  const handleOpenDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setConfirmModalOpen(true);
  };

  const handleOpenPrintModal = (product: Product) => {
    setProductToPrint(product);
    setPrintModalOpen(true);
  };

  const handleSave = async (productData: Omit<Product, 'id'> & { id?: number }): Promise<Product> => {
    const savedProduct = await onSaveProduct(productData);
    setProductModalOpen(false);
    return savedProduct;
  };
  
  const handleDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setConfirmModalOpen(false);
      setProductToDelete(null);
    }
  };

  const formatPrice = (priceValue: number) => {
     const convertedValue = priceValue * currency.rate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
      }).format(convertedValue);
  };

  const exportToCSV = () => {
    const headers = ['الكود', 'الباركود', 'اسم المنتج', 'المورد', 'التصنيف', 'سعر البيع', 'سعر التكلفة', 'إجمالي الكمية'];
    const rows = sortedProducts.map(p => [p.code, p.barcode, p.name, p.supplier, p.categoryName, p.price, p.costPrice, p.totalStock].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification({ type: 'success', title: 'تم التصدير', message: 'تم تصدير قائمة المنتجات بنجاح.' });
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleImport = () => {
    // This is a simulation
    const importedProducts: Omit<Product, 'id'>[] = [
        { code: 'IM-001', barcode: '900000000001', name: 'منتج مستورد 1', description: 'وصف المنتج المستورد', costPrice: 90, profitMargin: 11.11, price: 100, packagePrice: 1080, packagingType: 'كرتون', itemsPerPackage: 12, stockLocations: [{ warehouseId: 1, quantity: 50 }], categoryId: 1, expiryDate: '', supplier: 'المورد الدولي' },
        { code: 'IM-002', barcode: '900000000002', name: 'منتج مستورد 2', description: 'وصف المنتج المستورد', costPrice: 20, profitMargin: 25, price: 25, packagePrice: 80, packagingType: 'صندوق', itemsPerPackage: 4, stockLocations: [{ warehouseId: 1, quantity: 200 }], categoryId: 1, expiryDate: '', supplier: 'المورد الدولي' },
    ];
    importedProducts.forEach(p => onSaveProduct(p));
    addNotification({ type: 'info', title: 'تم الاستيراد', message: 'تمت محاكاة استيراد منتجات جديدة.' });
  };
  
  const SortIndicator: React.FC<{ columnKey: SortKey }> = ({ columnKey }) => {
      if (!sortConfig || sortConfig.key !== columnKey) return null;
      return sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  const getExpiryStatus = (expiryDate: string): { className: string, label: string } => {
    if (!expiryDate) return { className: '', label: '' };
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    now.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < now) {
      return { className: 'text-red-600 dark:text-red-400 font-bold', label: ' (منتهي الصلاحية)' };
    }
    if (expiry <= thirtyDaysFromNow) {
      return { className: 'text-yellow-600 dark:text-yellow-400 font-semibold', label: ' (قارب على الانتهاء)' };
    }
    return { className: '', label: '' };
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 no-print">إدارة المنتجات</h1>
      
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 no-print">
            <div className="relative w-full md:w-1/3">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <SearchIcon />
                </span>
                <input
                type="text"
                placeholder="بحث (اسم, كود, مورد...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-sm text-gray-700 bg-gray-200/50 dark:bg-gray-900/50 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
            </div>
            <div className="w-full md:w-auto flex flex-wrap items-center justify-center gap-2">
                {hasPermission('MANAGE_PRODUCTS') && <button onClick={handleImport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><UploadIcon /> استيراد</button>}
                <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><DownloadIcon /> تصدير</button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><PrinterIcon /> طباعة</button>
                {hasPermission('MANAGE_PRODUCTS') && (
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]"
                    >
                        <PlusIcon />
                        إضافة منتج
                    </button>
                )}
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3 w-10"></th>
                <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('code')} className="flex items-center gap-1">الكود <SortIndicator columnKey="code" /></button></th>
                <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('name')} className="flex items-center gap-1">اسم المنتج <SortIndicator columnKey="name" /></button></th>
                <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('supplier')} className="flex items-center gap-1">المورد <SortIndicator columnKey="supplier" /></button></th>
                <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('categoryName')} className="flex items-center gap-1">التصنيف <SortIndicator columnKey="categoryName" /></button></th>
                <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('price')} className="flex items-center gap-1">سعر البيع <SortIndicator columnKey="price" /></button></th>
                <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('totalStock')} className="flex items-center gap-1">إجمالي الكمية <SortIndicator columnKey="totalStock" /></button></th>
                <th scope="col" className="px-6 py-3"><button onClick={() => requestSort('expiryDate')} className="flex items-center gap-1">الصلاحية <SortIndicator columnKey="expiryDate" /></button></th>
                <th scope="col" className="px-6 py-3 text-center no-print">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const expiryStatus = getExpiryStatus(product.expiryDate);
                return (
                <React.Fragment key={product.id}>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-4 py-2">
                            <button 
                                onClick={() => toggleRow(product.id)} 
                                className="p-1 disabled:opacity-30" 
                                disabled={product.stockLocations.length === 0}
                                aria-label={expandedRows.has(product.id) ? 'Collapse row' : 'Expand row'}
                            >
                                {product.stockLocations.length > 0 && <ChevronRightIcon className={`transition-transform ${expandedRows.has(product.id) ? 'rotate-90' : ''}`} />}
                            </button>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{product.code}</td>
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.name}</th>
                        <td className="px-6 py-4">{product.supplier}</td>
                        <td className="px-6 py-4">{product.categoryName}</td>
                        <td className="px-6 py-4">{formatPrice(product.price)}</td>
                        <td className="px-6 py-4">{product.totalStock}</td>
                        <td className={`px-6 py-4 ${expiryStatus.className}`}>
                            {product.expiryDate}
                            {expiryStatus.label && <span className="text-xs">{expiryStatus.label}</span>}
                        </td>
                        <td className="px-6 py-4 text-center no-print">
                            <div className="flex justify-center items-center gap-2">
                            <button onClick={() => handleOpenPrintModal(product)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded-full" title="طباعة باركود"><BarcodeIcon /></button>
                            {hasPermission('MANAGE_PRODUCTS') && <button onClick={() => handleOpenEditModal(product)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"><PencilIcon /></button>}
                            {hasPermission('DELETE_PRODUCTS') && <button onClick={() => handleOpenDeleteConfirm(product)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon /></button>}
                            </div>
                        </td>
                    </tr>
                    {expandedRows.has(product.id) && (
                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                            <td colSpan={9} className="p-4">
                                <div className="px-8">
                                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">تفاصيل المخزون حسب الموقع:</h4>
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {product.stockLocations.map(sl => (
                                            <li key={sl.warehouseId} className="flex justify-between items-center py-2 text-sm">
                                                <span>{getWarehouseName(sl.warehouseId)}</span>
                                                <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{sl.quantity} قطعة</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
              )})}
            </tbody>
          </table>
          {sortedProducts.length === 0 && (
             <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                لا توجد منتجات مطابقة لبحثك.
            </p>
          )}
        </div>
      </div>
      
      {isProductModalOpen && (
        <ProductModal 
            isOpen={isProductModalOpen}
            onClose={() => setProductModalOpen(false)}
            onSave={handleSave}
            product={editingProduct}
            currency={currency}
            suppliers={suppliers}
            warehouses={warehouses}
            categories={categories}
            products={products}
        />
      )}
      
      {isConfirmModalOpen && productToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            onConfirm={handleDelete}
            title="تأكيد الحذف"
            message={`هل أنت متأكد من رغبتك في حذف المنتج "${productToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      )}

      {isPrintModalOpen && productToPrint && (
        <BarcodePrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setPrintModalOpen(false)}
            product={productToPrint}
            onPrint={(quantity) => {
                onPrintBarcodes(productToPrint, quantity);
                setPrintModalOpen(false);
            }}
        />
      )}
    </>
  );
};

export default ProductManagement;