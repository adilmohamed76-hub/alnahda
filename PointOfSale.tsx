import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Product, SalesOrder, SalesOrderItem, Currency, Customer, Warehouse, User, Notification, SystemSettings, PaymentMethod, PosShift, Permission } from './types';
import { TrashIcon, UsersIcon, BarcodeIcon, CameraIcon, XIcon, SearchIcon, CreditCardIcon, LinkIcon, BanknotesIcon, ArrowUturnLeftIcon } from './Icons';
import PosInvoiceToPrint from './PosInvoiceToPrint';
import PaymentLinkModal from './PaymentLinkModal';
import PosShiftModal from './PosShiftModal';

declare const Html5Qrcode: any;

interface PointOfSaleProps {
  products: Product[];
  customers: Customer[];
  warehouses: Warehouse[];
  onSaveSalesOrder: (so: Omit<SalesOrder, 'id'> & { id?: number }) => Promise<SalesOrder>;
  onUpdateStatus: (soId: number, status: SalesOrder['status']) => void;
  currency: Currency;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  currentUser: User | null;
  systemSettings: SystemSettings;
  activeShift: PosShift | null;
  onStartShift: (openingBalance: number) => Promise<void>;
  onEndShift: (shiftId: number, closingBalance: number) => Promise<PosShift>;
  hasPermission: (permission: Permission) => boolean;
}

const PointOfSale: React.FC<PointOfSaleProps> = (props) => {
  const { products, customers, warehouses, onSaveSalesOrder, onUpdateStatus, currency, addNotification, currentUser, systemSettings, activeShift, onStartShift, onEndShift, hasPermission } = props;
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [inputBuffer, setInputBuffer] = useState('');
  const [isNewInput, setIsNewInput] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [invoiceDataForPrint, setInvoiceDataForPrint] = useState<{ invoice: SalesOrder; user: User | null, settings: SystemSettings } | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const html5QrCodeRef = useRef<any>(null);
  const qrCodeRegionId = "html5qr-code-full-region";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('نقدي');
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [isPaymentLinkModalOpen, setPaymentLinkModalOpen] = useState(false);
  
  const [mode, setMode] = useState<'Sale' | 'Return'>('Sale');
  const [isShiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<'start' | 'end'>('start');

  const mainWarehouse = useMemo(() => warehouses.find(w => w.type === 'رئيسي') || warehouses[0], [warehouses]);
  const cashCustomer = useMemo(() => customers.find(c => c.id === 1), [customers]);
  const featuredProducts = useMemo(() => products.filter(p => p.isFeatured), [products]);

  useEffect(() => {
    if (invoiceDataForPrint) {
      window.print();
      setInvoiceDataForPrint(null);
    }
  }, [invoiceDataForPrint]);
  
  useEffect(() => {
    if (!isScannerOpen) return;

    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    html5QrCodeRef.current = html5QrCode;

    const onScanSuccess = (decodedText: string) => {
        html5QrCodeRef.current.stop().then(() => {
            setIsScannerOpen(false);
            addProductByBarcode(decodedText.trim());
        }).catch((err:any) => {
             console.error("Failed to stop scanner", err);
             setIsScannerOpen(false);
        });
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, undefined)
      .catch(() => {
        html5QrCode.start({ }, config, onScanSuccess, undefined)
          .catch(() => {
            addNotification({ type: 'error', title: 'خطأ في الكاميرا', message: 'لم يتم العثور على كاميرا أو فشل تشغيلها.' });
            setIsScannerOpen(false);
          });
      });

    return () => {
        if (html5QrCodeRef.current?.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
        }
    };
}, [isScannerOpen]);

  useEffect(() => {
      // If user has POS access but no active shift, force them to start one.
      if (hasPermission('ACCESS_POS') && !activeShift) {
          setShiftModalMode('start');
          setShiftModalOpen(true);
      }
  }, [activeShift, hasPermission]);


  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.price, 0), [items]);
  const taxAmount = useMemo(() => subtotal * (systemSettings.vatRate / 100), [subtotal, systemSettings.vatRate]);
  const totalAmount = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);
  const getStock = (productId: number) => products.find(p => p.id === productId)?.stockLocations.find(sl => sl.warehouseId === mainWarehouse?.id)?.quantity || 0;

  const searchResults = useMemo(() => {
    if (!productSearchTerm.trim()) return [];
    const term = productSearchTerm.toLowerCase();
    return products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term)
    );
  }, [productSearchTerm, products]);


  const addProduct = (product: Product) => {
    if (mode === 'Sale') {
        if (product.expiryDate) {
            const expiry = new Date(product.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiry < today) {
                addNotification({ type: 'error', title: 'منتج منتهي الصلاحية', message: `لا يمكن بيع المنتج "${product.name}" لأنه منتهي الصلاحية.` });
                return;
            }
        }
        const availableStock = getStock(product.id);
        const itemIndex = items.findIndex(item => item.productId === product.id);

        if (itemIndex !== -1) {
            const existingItem = items[itemIndex];
            if (existingItem.quantity >= availableStock) {
                addNotification({ type: 'error', title: 'نفاد المخزون', message: `المنتج "${product.name}" غير متوفر بكمية إضافية.` });
                return;
            }
            const newItems = [...items];
            newItems[itemIndex] = { ...existingItem, quantity: existingItem.quantity + 1 };
            setItems(newItems);
            setSelectedItemId(product.id);
        } else {
            if (availableStock < 1) {
                addNotification({ type: 'error', title: 'نفاد المخزون', message: `المنتج "${product.name}" غير متوفر.` });
                return;
            }
            const newItem: SalesOrderItem = { productId: product.id, productName: product.name, quantity: 1, price: product.price };
            setItems(prev => [...prev, newItem]);
            setSelectedItemId(product.id);
        }
    } else { // Return Mode
        const itemIndex = items.findIndex(item => item.productId === product.id);
        if (itemIndex === -1) {
            const newItem: SalesOrderItem = { productId: product.id, productName: product.name, quantity: 1, price: product.price };
            setItems(prev => [...prev, newItem]);
            setSelectedItemId(product.id);
        } else {
            const newItems = [...items];
            newItems[itemIndex].quantity += 1;
            setItems(newItems);
            setSelectedItemId(product.id);
        }
    }
    setIsNewInput(true);
  };
  
  const addProductByBarcode = (scannedBarcode: string) => {
    const product = products.find(p => p.barcode === scannedBarcode);
    if (!product) {
        addNotification({ type: 'error', title: 'منتج غير موجود', message: `لم يتم العثور على منتج بالباركود ${scannedBarcode}.` });
        return;
    }
    addProduct(product);
  };

  const handleBarcodeScan = () => {
    if (!barcodeInput.trim()) return;
    addProductByBarcode(barcodeInput.trim());
    setBarcodeInput('');
  };

  const updateQuantity = (newQty: number) => {
    if (!selectedItemId) return;
    const itemIndex = items.findIndex(i => i.productId === selectedItemId);
    if (itemIndex === -1) return;
    
    if (mode === 'Sale') {
        const availableStock = getStock(selectedItemId);
        if (newQty > availableStock) {
            addNotification({ type: 'error', title: 'كمية غير متوفرة', message: `الكمية المتاحة هي ${availableStock} فقط.` });
            newQty = availableStock;
        }
    }
    if (newQty <= 0) newQty = 1;

    const newItems = [...items];
    newItems[itemIndex].quantity = newQty;
    setItems(newItems);
  };
  
  const handleNumpad = (value: string) => {
    if (!selectedItemId) {
        addNotification({ type: 'info', title: 'تنبيه', message: 'الرجاء تحديد منتج من الفاتورة أولاً لتعديل كميته.'});
        return;
    }

    if (value === 'C') { setInputBuffer('1'); updateQuantity(1); setIsNewInput(true); return; }

    if (value === 'del') {
        const newBuffer = inputBuffer.length > 1 ? inputBuffer.slice(0, -1) : '1';
        setInputBuffer(newBuffer);
        updateQuantity(parseInt(newBuffer, 10));
        setIsNewInput(true);
        return;
    }
    
    const newBuffer = isNewInput ? value : inputBuffer + value;
    const newQuantity = parseInt(newBuffer, 10);

    if (!isNaN(newQuantity)) {
        setInputBuffer(newBuffer);
        updateQuantity(newQuantity);
        setIsNewInput(false);
    }
  };

  useEffect(() => {
    if(selectedItemId) {
        const item = items.find(i => i.productId === selectedItemId);
        setInputBuffer(item ? item.quantity.toString() : '');
        setIsNewInput(true);
    } else {
        setInputBuffer('');
    }
  }, [selectedItemId]);

  const handleFinalizeSale = async () => {
    if (items.length === 0 || !cashCustomer || !mainWarehouse || !activeShift) {
        addNotification({type: 'error', title: 'خطأ', message: 'الفاتورة فارغة أو لا يوجد عميل نقدي/مخزن رئيسي/فترة عمل نشطة.'});
        return;
    }

    const newSO: Omit<SalesOrder, 'id'> = {
        soNumber: `POS-${Date.now()}`,
        customerId: cashCustomer.id,
        customerName: cashCustomer.name,
        orderDate: new Date().toISOString(),
        status: 'قيد التجهيز',
        items,
        subtotal,
        taxAmount,
        totalAmount,
        sourceWarehouseId: mainWarehouse.id,
        paymentMethod,
        type: mode,
        shiftId: activeShift.id,
    };
    
    try {
        if (paymentMethod === 'رابط دفع') {
            const link = `https://pay.example.ly/inv/${newSO.soNumber}`;
            newSO.paymentLink = link;
            const savedOrder = await onSaveSalesOrder(newSO);
            await onUpdateStatus(savedOrder.id, 'مكتمل');
            setPaymentLink(link);
            setPaymentLinkModalOpen(true);
        } else {
            const savedOrder = await onSaveSalesOrder(newSO);
            await onUpdateStatus(savedOrder.id, 'مكتمل');
            setInvoiceDataForPrint({ invoice: savedOrder, user: currentUser, settings: systemSettings });
        }
        
        setItems([]);
        setSelectedItemId(null);
        setMode('Sale');
    } catch (error) {
        addNotification({ type: 'error', title: 'فشل الحفظ', message: 'لم يتم حفظ الفاتورة. يرجى المحاولة مرة أخرى.' });
    }
  };
  
  if (!hasPermission('ACCESS_POS')) {
    return (
      <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
        <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }

  if (!activeShift) {
    return (
        <PosShiftModal
            isOpen={isShiftModalOpen}
            onClose={() => {}}
            onStartShift={onStartShift}
            mode="start"
        />
    );
  }

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'del'];
  
  const PaymentMethodButton: React.FC<{ method: PaymentMethod; icon: React.ReactNode; selected: boolean; onClick: () => void;}> = ({ method, icon, selected, onClick }) => (
    <button type="button" onClick={onClick} className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${selected ? 'bg-blue-500/10 border-[var(--primary-color)] text-[var(--primary-color)] shadow-md' : 'border-transparent bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
        {icon}
        <span className="text-xs font-semibold mt-1">{method}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full">
        {isShiftModalOpen && activeShift && (
            <PosShiftModal 
                isOpen={isShiftModalOpen} 
                onClose={() => setShiftModalOpen(false)}
                onEndShift={onEndShift}
                activeShift={activeShift}
                mode="end"
            />
        )}
      {isScannerOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center no-print p-4">
              <div className="bg-white rounded-lg p-4 relative w-full" style={{ maxWidth: '500px' }}>
                  <button onClick={() => setIsScannerOpen(false)} className="absolute top-2 right-2 p-1 bg-white/50 rounded-full text-gray-800 hover:bg-gray-200" aria-label="Close scanner"><XIcon /></button>
                  <div id={qrCodeRegionId}></div>
              </div>
          </div>
      )}
       {isPaymentLinkModalOpen && paymentLink && ( <PaymentLinkModal isOpen={isPaymentLinkModalOpen} onClose={() => setPaymentLinkModalOpen(false)} paymentLink={paymentLink}/> )}
      
      <div className="grid grid-cols-12 gap-6 flex-1 h-full">
        {/* Left - Products & Numpad */}
        <div className="col-span-7 flex flex-col no-print">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-1 overflow-y-auto p-2 bg-gray-700 dark:bg-gray-800 rounded-lg">
                {featuredProducts.map(p => (
                    <button key={p.id} onClick={() => addProduct(p)} className="flex flex-col items-center justify-center p-2 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-lg shadow hover:shadow-lg hover:ring-2 ring-[var(--primary-color)]">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 flex items-center justify-center font-bold text-2xl text-[var(--primary-color)]">{p.name.substring(0,2)}</div>
                        <span className="text-xs text-center font-semibold">{p.name}</span>
                        <span className="text-xs font-bold text-[var(--primary-color)]">{formatCurrency(p.price)}</span>
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                {numpadKeys.map(key => (
                    <button key={key} onClick={() => handleNumpad(key)} className="py-4 text-2xl font-bold bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-md shadow hover:bg-gray-200 dark:hover:bg-gray-700">
                        {key === 'del' ? '⌫' : key}
                    </button>
                ))}
            </div>
        </div>

        {/* Right - Invoice */}
        <div className={`col-span-5 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-lg shadow-lg flex flex-col no-print border-4 ${mode === 'Return' ? 'border-red-500' : 'border-transparent'}`}>
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><UsersIcon/><h3 className="font-bold text-lg">{cashCustomer?.name}</h3></div>
                    <button onClick={() => { setMode(m => m === 'Sale' ? 'Return' : 'Sale'); setItems([]); setSelectedItemId(null); }} className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full ${mode === 'Return' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <ArrowUturnLeftIcon /> {mode === 'Return' ? 'وضع المرتجع' : 'مرتجع'}
                    </button>
                </div>
                 <div className="relative mt-4">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><BarcodeIcon className="w-6 h-6" /></span>
                    <input type="text" placeholder="امسح الباركود هنا..." value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeScan(); } }} className="w-full pr-12 pl-12 py-3 text-lg bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-mono focus:ring-2 focus:ring-[var(--primary-color)]" autoFocus/>
                     <button type="button" onClick={() => setIsScannerOpen(true)} className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-[var(--primary-color)]" aria-label="Scan with camera"><CameraIcon className="w-6 h-6" /></button>
                </div>
                 <div className="relative mt-2">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><SearchIcon className="w-5 h-5" /></span>
                    <input type="text" placeholder="أو ابحث بالاسم/الكود..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"/>
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] border border-gray-200 dark:border-gray-700 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {searchResults.map(p => {
                                const stock = getStock(p.id);
                                return (<div key={p.id} onClick={() => { addProduct(p); setProductSearchTerm(''); }} className="p-3 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <div><p className="font-semibold">{p.name}</p><p className="text-xs text-gray-500">{p.code}</p></div>
                                    <span className={`text-xs font-bold ${stock > 0 ? 'text-green-500' : 'text-red-500'}`}>{stock > 0 ? `متوفر: ${stock}` : 'نفد'}</span>
                                </div>);
                            })}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="p-3 text-xs font-bold text-gray-500 grid grid-cols-12 gap-2 border-b">
                    <div className="col-span-5">المنتج</div><div className="col-span-2 text-center">الكمية</div><div className="col-span-2 text-center">السعر</div><div className="col-span-2 text-left">الإجمالي</div><div className="col-span-1"></div>
                </div>
                {items.map(item => (
                    <div key={item.productId} onClick={() => setSelectedItemId(item.productId)} className={`grid grid-cols-12 gap-2 items-center p-3 cursor-pointer border-r-4 ${selectedItemId === item.productId ? 'bg-blue-500/10 border-[var(--primary-color)]' : 'border-transparent'}`}>
                        <div className="col-span-5"><p className="font-semibold text-sm">{item.productName}</p></div>
                        <div className="col-span-2 text-center font-mono">{item.quantity}</div>
                        <div className="col-span-2 text-center text-xs">{formatCurrency(item.price)}</div>
                        <div className="col-span-2 text-left font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                        <div className="col-span-1 text-left"><button onClick={(e) => { e.stopPropagation(); setItems(prev => prev.filter(i => i.productId !== item.productId)); }} className="text-red-500 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-4 h-4"/></button></div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-center p-8 text-gray-500">الفاتورة فارغة</p>}
            </div>
            <div className="p-4 mt-auto border-t space-y-2">
                <div className="flex justify-between items-center text-md"><span className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">المجموع الفرعي:</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between items-center text-md"><span className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">الضريبة ({systemSettings.vatRate}%):</span><span className="font-semibold">{formatCurrency(taxAmount)}</span></div>
                <div className="flex justify-between items-center text-2xl font-bold pt-2 border-t"><span>الإجمالي:</span><span>{formatCurrency(totalAmount)}</span></div>
                <div className="pt-2">
                    <label className="block text-sm font-medium mb-2 text-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">طريقة الدفع</label>
                    <div className="grid grid-cols-3 gap-2">
                        <PaymentMethodButton method="نقدي" icon={<BanknotesIcon/>} selected={paymentMethod === 'نقدي'} onClick={() => setPaymentMethod('نقدي')} />
                        <PaymentMethodButton method="بطاقة" icon={<CreditCardIcon/>} selected={paymentMethod === 'بطاقة'} onClick={() => setPaymentMethod('بطاقة')} />
                        <PaymentMethodButton method="رابط دفع" icon={<LinkIcon/>} selected={paymentMethod === 'رابط دفع'} onClick={() => setPaymentMethod('رابط دفع')} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                     <button onClick={() => { setItems([]); setSelectedItemId(null); }} className="w-full p-4 bg-red-500 text-white font-bold rounded-lg text-lg">إلغاء</button>
                    <button onClick={handleFinalizeSale} className="w-full p-4 bg-green-500 text-white font-bold rounded-lg text-lg" disabled={items.length === 0}>{mode === 'Return' ? 'حفظ المرتجع' : (paymentMethod === 'رابط دفع' ? 'إنشاء رابط دفع' : 'حفظ وطباعة')}</button>
                </div>
            </div>
             <div className="p-2 text-xs text-center border-t text-gray-500">
                <span>المستخدم: {activeShift.userName}</span> | <span>بداية الدوام: {new Date(activeShift.startTime).toLocaleTimeString()}</span> | 
                {hasPermission('MANAGE_POS_SHIFTS') && <button onClick={() => { setShiftModalMode('end'); setShiftModalOpen(true); }} className="ml-2 font-bold text-red-500 hover:underline">إنهاء الدوام</button>}
            </div>
        </div>
      </div>
      {invoiceDataForPrint && <PosInvoiceToPrint invoice={invoiceDataForPrint.invoice} currency={currency} user={invoiceDataForPrint.user} settings={invoiceDataForPrint.settings} />}
    </div>
  );
};

export default PointOfSale;