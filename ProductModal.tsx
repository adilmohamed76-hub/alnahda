import React, { useState, useEffect, useMemo, useRef } from 'react';
// FIX: Corrected import path for type definitions
import type { Product, Currency, Supplier, Warehouse, ProductCategory } from './types/index';
import { SparklesIcon, PrinterIcon } from './Icons';

declare const JsBarcode: any;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> & { id?: number }) => Promise<Product>;
  product: Product | null;
  currency: Currency;
  suppliers: Supplier[];
  warehouses: Warehouse[];
  categories: ProductCategory[];
  products: Product[];
  initialValues?: Partial<Omit<Product, 'id'>>;
}

const packagingTypes: Array<'كرتون' | 'صندوق' | 'علبة'> = ['كرتون', 'صندوق', 'علبة'];

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, currency, suppliers, warehouses, categories, products, initialValues }) => {
  const getInitialFormData = () => {
    const defaultCategory = categories.length > 0 ? categories[0].id.toString() : '';
    return {
      name: '',
      description: '',
      reorderPoint: '0',
      categoryId: defaultCategory,
      code: '',
      barcode: '',
      packagePrice: '0',
      packagingType: packagingTypes[2],
      itemsPerPackage: '1',
      profitMargin: '10',
      expiryDate: '',
      supplier: '',
      stockLocations: [] as { warehouseId: number, quantity: number }[],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [calculatedPrices, setCalculatedPrices] = useState({ cost: 0, selling: 0 });
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        reorderPoint: product.reorderPoint?.toString() || '0',
        categoryId: product.categoryId.toString(),
        code: product.code,
        barcode: product.barcode,
        packagePrice: product.packagePrice.toString(),
        packagingType: product.packagingType,
        itemsPerPackage: product.itemsPerPackage.toString(),
        profitMargin: product.profitMargin.toFixed(2),
        expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
        supplier: product.supplier,
        stockLocations: product.stockLocations,
      });
    } else {
      const defaultCategory = categories.length > 0 ? categories[0].id.toString() : '';
      setFormData({
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        reorderPoint: (initialValues?.reorderPoint || 0).toString(),
        categoryId: initialValues?.categoryId?.toString() || defaultCategory,
        code: initialValues?.code || '',
        barcode: initialValues?.barcode || '',
        packagePrice: (initialValues?.packagePrice || 0).toString(),
        packagingType: initialValues?.packagingType || packagingTypes[2],
        itemsPerPackage: (initialValues?.itemsPerPackage || 1).toString(),
        profitMargin: (initialValues?.profitMargin || 10).toString(),
        expiryDate: initialValues?.expiryDate || '',
        supplier: initialValues?.supplier || (suppliers.length > 0 ? suppliers[0].name : ''),
        stockLocations: initialValues?.stockLocations || [],
      });
    }
  }, [product, isOpen, suppliers, initialValues, categories]);

  useEffect(() => {
    const pkgPrice = parseFloat(formData.packagePrice) || 0;
    const items = parseInt(formData.itemsPerPackage, 10) || 1;
    const margin = parseFloat(formData.profitMargin) || 0;
    
    const cost = items > 0 ? pkgPrice / items : 0;
    const selling = cost * (1 + margin / 100);
    
    setCalculatedPrices({ cost, selling });
  }, [formData.packagePrice, formData.itemsPerPackage, formData.profitMargin]);
  
  useEffect(() => {
    if (barcodeRef.current && formData.barcode) {
      try {
        JsBarcode(barcodeRef.current, formData.barcode, {
          format: "EAN13",
          displayValue: true,
          fontSize: 18,
          textMargin: 0,
          margin: 10,
        });
      } catch (e) {
        if (barcodeRef.current) {
          barcodeRef.current.innerHTML = '';
        }
      }
    }
  }, [formData.barcode]);

  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === parseInt(formData.categoryId, 10)),
    [formData.categoryId, categories]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "categoryId") {
        const newCategory = categories.find(c => c.id === parseInt(value, 10));
        setFormData(prev => ({ 
            ...prev, 
            categoryId: value,
            expiryDate: newCategory?.isPerishable ? prev.expiryDate : '', // Clear expiry if not perishable
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const generateBarcode = () => {
    let newBarcode: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        const base = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        
        let sum1 = 0;
        let sum2 = 0;
        for (let i = 0; i < 12; i++) {
            if (i % 2 === 0) {
                sum1 += parseInt(base[i]);
            } else {
                sum2 += parseInt(base[i]);
            }
        }
        const totalSum = sum1 + (sum2 * 3);
        const checksum = (10 - (totalSum % 10)) % 10;
        newBarcode = base + checksum;
        
        if (!products.some(p => p.barcode === newBarcode)) {
            isUnique = true;
        }
        attempts++;
    }
    
    if(isUnique) {
      setFormData(prev => ({ ...prev, barcode: newBarcode! }));
    } else {
      alert("فشل في إنشاء باركود فريد. يرجى المحاولة مرة أخرى أو إدخاله يدويًا.");
    }
  };
  
  const handlePrintBarcode = () => {
    if (barcodeRef.current) {
        const printArea = document.createElement('div');
        printArea.classList.add('barcode-print-area');
        const svgClone = barcodeRef.current.cloneNode(true) as SVGSVGElement;
        svgClone.style.width = '300px';
        svgClone.style.height = 'auto';
        printArea.appendChild(svgClone);
        document.body.appendChild(printArea);
        document.body.classList.add('printing-barcode');
        
        window.print();
        
        document.body.removeChild(printArea);
        document.body.classList.remove('printing-barcode');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      id: product?.id,
      name: formData.name,
      description: formData.description,
      reorderPoint: parseInt(formData.reorderPoint, 10) || 0,
      categoryId: parseInt(formData.categoryId, 10),
      code: formData.code,
      barcode: formData.barcode,
      packagePrice: parseFloat(formData.packagePrice) || 0,
      packagingType: formData.packagingType,
      itemsPerPackage: parseInt(formData.itemsPerPackage, 10) || 1,
      expiryDate: selectedCategory?.isPerishable ? formData.expiryDate : '',
      supplier: formData.supplier,
      costPrice: calculatedPrices.cost,
      profitMargin: parseFloat(formData.profitMargin) || 0,
      price: calculatedPrices.selling,
      stockLocations: formData.stockLocations, // Pass existing locations
    });
  };

  const formatPrice = (priceValue: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2
      }).format(priceValue * currency.rate);
  };
  
  const getWarehouseName = (id: number) => warehouses.find(w => w.id === id)?.name || 'مخزن غير معروف';

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 overflow-y-auto"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-3xl p-6 my-8 relative transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">اسم المنتج</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
            </div>
             <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">المورد</label>
                <select name="supplier" id="supplier" value={formData.supplier} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]">
                    {suppliers.length === 0 && <option disabled>لا يوجد موردون</option>}
                    {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">كود المنتج</label>
                <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
              </div>
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">الباركود</label>
                <div className="flex gap-2">
                  <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleChange} required className="flex-grow p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
                  <button type="button" onClick={generateBarcode} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
                    <SparklesIcon className="w-4 h-4" />
                    توليد
                  </button>
                </div>
                {formData.barcode && (
                  <div className="mt-4 p-4 bg-white rounded-lg border flex flex-col items-center">
                    <svg ref={barcodeRef}></svg>
                    <button type="button" onClick={handlePrintBarcode} className="mt-2 flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                      <PrinterIcon className="w-4 h-4"/>
                      طباعة الباركود
                    </button>
                  </div>
                )}
              </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">الوصف</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={2} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
          </div>
          {/* Packaging & Stock */}
          <div className="pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)] space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">التصنيف</label>
                    <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                {selectedCategory?.isPerishable && (
                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">تاريخ الانتهاء</label>
                        <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate} onChange={handleChange} required={selectedCategory?.isPerishable} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
                    </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="packagingType" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">نوع العبوة</label>
                    <select name="packagingType" id="packagingType" value={formData.packagingType} onChange={handleChange} required className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]">
                      {packagingTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="itemsPerPackage" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">القطع في العبوة</label>
                    <input type="number" name="itemsPerPackage" id="itemsPerPackage" value={formData.itemsPerPackage} onChange={handleChange} required min="1" className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="reorderPoint" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">نقطة إعادة الطلب (الإجمالي)</label>
                    <input type="number" name="reorderPoint" id="reorderPoint" value={formData.reorderPoint} onChange={handleChange} min="0" className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">الكمية الحالية</label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md space-y-2 max-h-32 overflow-y-auto">
                        {formData.stockLocations.length > 0 ? (
                            formData.stockLocations.map(sl => (
                                <div key={sl.warehouseId} className="flex justify-between items-center text-sm">
                                    <span>{getWarehouseName(sl.warehouseId)}:</span>
                                    <span className="font-bold">{sl.quantity} قطعة</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-xs text-gray-500">لا توجد كمية في المخازن</p>
                        )}
                    </div>
                 </div>
              </div>
          </div>
           {/* Pricing */}
           <div className="pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                 <div>
                     <label htmlFor="packagePrice" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">سعر تكلفة العبوة ({currency.symbol})</label>
                    <input type="number" name="packagePrice" id="packagePrice" value={formData.packagePrice} onChange={handleChange} required min="0" step="0.01" className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
                </div>
                 <div>
                    <label htmlFor="profitMargin" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">هامش الربح (%)</label>
                    <input type="number" name="profitMargin" id="profitMargin" value={formData.profitMargin} onChange={handleChange} required min="0" step="0.01" className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" />
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <span className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">سعر التكلفة للقطعة:</span>
                    <span className="block font-bold text-lg text-gray-800 dark:text-white">{formatPrice(calculatedPrices.cost)}</span>
                </div>
                 <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-md">
                    <span className="text-sm text-green-800 dark:text-green-300">سعر البيع المقترح:</span>
                    <span className="block font-bold text-lg text-green-900 dark:text-green-200">{formatPrice(calculatedPrices.selling)}</span>
                </div>
              </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              إلغاء
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]">
              {product ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;