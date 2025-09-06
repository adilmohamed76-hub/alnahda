import React, { useState, useMemo } from 'react';
import type { Product, InventoryLog, Currency, SalesOrder, Warehouse, InventoryTransfer, Permission, InventoryCount, PurchaseOrder } from './types';
import { ArchiveIcon, DollarSignIcon, CubeIcon, ExclamationTriangleIcon, ClipboardListIcon, FileTextIcon, GridIcon, PlusIcon, SwitchHorizontalIcon, ChevronRightIcon, ClipboardCheckIcon, LightbulbIcon } from './Icons';
import ProductInventoryLogModal from './ProductInventoryLogModal';
import InventoryTransferModal from './InventoryTransferModal';
import InventoryCountList from './InventoryCountList';
import InventoryCountDetail from './InventoryCountDetail';

interface InventoryManagementProps {
    products: Product[];
    inventoryLogs: InventoryLog[];
    currency: Currency;
    salesOrders: SalesOrder[];
    warehouses: Warehouse[];
    inventoryTransfers: InventoryTransfer[];
    onSaveInventoryTransfer: (transfer: Omit<InventoryTransfer, 'id'>) => void;
    inventoryCounts: InventoryCount[];
    onPostInventoryCount: (count: InventoryCount) => void;
    hasPermission: (permission: Permission) => boolean;
    onCreateFeasibilityStudy: (source: 'inventory') => void;
}

type InventoryTab = 'overview' | 'list' | 'reorder' | 'transfers' | 'counts';

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; action?: React.ReactNode }> = ({ title, value, icon, color, action }) => (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] uppercase tracking-wider">{title}</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
            <div className={`text-white rounded-full p-3 ${color}`}>
                {icon}
            </div>
        </div>
         {action && <div className="mt-4">{action}</div>}
    </div>
);

const InventoryManagement: React.FC<InventoryManagementProps> = (props) => {
    const { products, inventoryLogs, currency, salesOrders, warehouses, inventoryTransfers, onSaveInventoryTransfer, hasPermission, inventoryCounts, onPostInventoryCount, onCreateFeasibilityStudy } = props;
    const [activeTab, setActiveTab] = useState<InventoryTab>('overview');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isTransferModalOpen, setTransferModalOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [activeCount, setActiveCount] = useState<InventoryCount | null>(null);
    const [warehouseForNewCount, setWarehouseForNewCount] = useState<number | null>(null);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(value * currency.rate);

    const getWarehouseName = (id: number) => warehouses.find(w => w.id === id)?.name || 'غير معروف';

    const productsWithTotalStock = useMemo(() => {
        return products.map(p => ({
            ...p,
            totalStock: p.stockLocations.reduce((sum, loc) => sum + loc.quantity, 0)
        }));
    }, [products]);

    const kpiData = useMemo(() => ({
        totalValue: formatCurrency(productsWithTotalStock.reduce((sum, p) => sum + (p.costPrice * p.totalStock), 0)),
        skuCount: products.length,
        reorderCount: productsWithTotalStock.filter(p => typeof p.reorderPoint === 'number' && p.totalStock <= p.reorderPoint).length,
        outOfStockCount: productsWithTotalStock.filter(p => p.totalStock === 0).length,
    }), [productsWithTotalStock, currency]);

    const reorderReportData = useMemo(() => {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const itemsToReorder = productsWithTotalStock.filter(p => typeof p.reorderPoint === 'number' && p.totalStock <= p.reorderPoint);

        return itemsToReorder.map(product => {
            const relevantSales = salesOrders.filter(so => new Date(so.orderDate) > ninetyDaysAgo);
            
            let totalSold = 0;
            relevantSales.forEach(so => { so.items.forEach(item => { if (item.productId === product.id) { totalSold += item.quantity; } }); });

            const avgDailySales = totalSold / 90;
            const safetyStock = Math.ceil(avgDailySales * 7);
            const suggestedQuantity = Math.max(0, Math.ceil((avgDailySales * 30) + safetyStock - product.totalStock));

            return { ...product, safetyStock, suggestedQuantity };
        });
    }, [productsWithTotalStock, salesOrders]);

    const toggleRow = (id: number) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(id)) newExpandedRows.delete(id);
        else newExpandedRows.add(id);
        setExpandedRows(newExpandedRows);
    };

    const exportReorderToCSV = () => {
        const headers = ['المنتج', 'المورد', 'الكمية الحالية', 'نقطة إعادة الطلب', 'مخزون الأمان', 'الكمية المقترحة للشراء'];
        const rows = reorderReportData.map(p => [p.name, p.supplier, p.totalStock, p.reorderPoint, p.safetyStock, p.suggestedQuantity].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = "reorder_report.csv";
        link.click();
    };

    const handleStartNewCount = (warehouseId: number) => {
        setWarehouseForNewCount(warehouseId);
        setActiveCount(null); // Ensure we are in "new" mode
    };

    const handleViewCount = (count: InventoryCount) => {
        setActiveCount(count);
        setWarehouseForNewCount(null);
    };

    const handleBackToList = () => {
        setActiveCount(null);
        setWarehouseForNewCount(null);
    };
    
    if (!hasPermission('VIEW_INVENTORY')) {
        return (
          <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
            <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
              ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
            </p>
          </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard title="القيمة الإجمالية للمخزون" value={kpiData.totalValue} icon={<DollarSignIcon />} color="bg-blue-500" 
                            action={hasPermission('CREATE_FEASIBILITY_STUDIES') ? (
                                <button onClick={() => onCreateFeasibilityStudy('inventory')} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-500/20">
                                    <LightbulbIcon />
                                    تحليل ربحية المخزون
                                </button>
                            ) : undefined}
                        />
                        <KpiCard title="عدد الأصناف في المخزون" value={kpiData.skuCount} icon={<CubeIcon />} color="bg-green-500" />
                        <KpiCard title="أصناف عند نقطة الطلب" value={kpiData.reorderCount} icon={<ExclamationTriangleIcon />} color="bg-yellow-500" />
                        <KpiCard title="أصناف نفدت كميتها" value={kpiData.outOfStockCount} icon={<ArchiveIcon />} color="bg-red-500" />
                    </div>
                );
            case 'list':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 w-10"></th>
                                    <th className="px-6 py-3">المنتج</th>
                                    <th className="px-6 py-3">إجمالي الكمية</th>
                                    <th className="px-6 py-3">قيمة التكلفة الإجمالية</th>
                                    <th className="px-6 py-3 text-center">سجل الحركة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productsWithTotalStock.map(p => (
                                    <React.Fragment key={p.id}>
                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-4 py-2"><button onClick={() => toggleRow(p.id)} className="p-1"><ChevronRightIcon className={`transition-transform ${expandedRows.has(p.id) ? 'rotate-90' : ''}`} /></button></td>
                                            <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{p.name}</th>
                                            <td className={`px-6 py-4 font-bold ${p.totalStock <= (p.reorderPoint ?? 0) ? 'text-red-500' : ''}`}>{p.totalStock}</td>
                                            <td className="px-6 py-4">{formatCurrency(p.totalStock * p.costPrice)}</td>
                                            <td className="px-6 py-4 text-center"><button onClick={() => setSelectedProduct(p)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" title="عرض سجل الحركة"><ClipboardListIcon className="w-5 h-5" /></button></td>
                                        </tr>
                                        {expandedRows.has(p.id) && (
                                            <tr className="bg-gray-50 dark:bg-gray-900/50"><td colSpan={5} className="p-4">
                                                <div className="px-4">
                                                    <h4 className="font-semibold mb-2">تفاصيل المخزون حسب الموقع:</h4>
                                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {p.stockLocations.map(sl => (
                                                            <li key={sl.warehouseId} className="flex justify-between py-2 text-sm">
                                                                <span>{getWarehouseName(sl.warehouseId)}</span>
                                                                <span className="font-mono">{sl.quantity}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </td></tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'reorder':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4 no-print">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">تقرير المنتجات التي تحتاج لإعادة طلب</h2>
                            <div className="flex gap-2">
                                <button onClick={exportReorderToCSV} className="flex items-center gap-2 px-3 py-2 text-sm font-medium"><GridIcon /> تصدير Excel</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium"><FileTextIcon /> طباعة/PDF</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th className="px-6 py-3">المنتج</th><th className="px-6 py-3">المورد</th><th className="px-6 py-3">الكمية الحالية</th><th className="px-6 py-3">نقطة إعادة الطلب</th><th className="px-6 py-3">مخزون الأمان</th><th className="px-6 py-3">الكمية المقترحة للشراء</th></tr></thead>
                                <tbody>{reorderReportData.map(p => (<tr key={p.id} className="bg-white border-b dark:bg-red-900/10 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"><th className="px-6 py-4 font-medium">{p.name}</th><td className="px-6 py-4">{p.supplier}</td><td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">{p.totalStock}</td><td className="px-6 py-4">{p.reorderPoint}</td><td className="px-6 py-4">{p.safetyStock}</td><td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{p.suggestedQuantity}</td></tr>))}</tbody>
                            </table>
                            {reorderReportData.length === 0 && <p className="text-center py-8">لا توجد منتجات تحتاج إلى إعادة طلب حاليًا.</p>}
                        </div>
                    </div>
                );
            case 'transfers':
                return (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">سجل تحويلات المخزون</h2>
                            {hasPermission('MANAGE_INVENTORY_TRANSFERS') && (
                                <button onClick={() => setTransferModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]"><PlusIcon/> إنشاء تحويل جديد</button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-right">
                               <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-3">المرجع</th><th className="px-6 py-3">من مخزن</th><th className="px-6 py-3">إلى مخزن</th><th className="px-6 py-3">التاريخ</th><th className="px-6 py-3">عدد الأصناف</th></tr></thead>
                               <tbody>
                                   {inventoryTransfers.map(t => (
                                       <tr key={t.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                           <td className="px-6 py-4 font-mono">{t.reference}</td>
                                           <td className="px-6 py-4">{getWarehouseName(t.fromWarehouseId)}</td>
                                           <td className="px-6 py-4">{getWarehouseName(t.toWarehouseId)}</td>
                                           <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                           <td className="px-6 py-4">{t.items.length}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                           {inventoryTransfers.length === 0 && <p className="text-center py-8">لم يتم إجراء أي تحويلات.</p>}
                        </div>
                     </div>
                );
             case 'counts':
                if (activeCount || warehouseForNewCount) {
                    return <InventoryCountDetail
                        count={activeCount}
                        warehouseId={warehouseForNewCount}
                        warehouses={warehouses}
                        products={products}
                        onPost={onPostInventoryCount}
                        onBack={handleBackToList}
                    />;
                }
                return <InventoryCountList 
                        counts={inventoryCounts} 
                        warehouses={warehouses}
                        onStartNew={handleStartNewCount}
                        onView={handleViewCount}
                        hasPermission={hasPermission}
                       />;
        }
    };

    const TabButton: React.FC<{ tab: InventoryTab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => (
        <button onClick={() => setActiveTab(tab)} className={`whitespace-nowrap flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:border-gray-300 dark:hover:border-gray-700'}`}>{icon} {label}</button>
    );

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 no-print">إدارة المخزون</h1>
            <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
                <div className="border-b border-[var(--border-light)] dark:border-[var(--border-dark)] mb-6 no-print">
                    <nav className="-mb-px flex space-x-reverse space-x-6" aria-label="Tabs">
                        <TabButton tab="overview" label="نظرة عامة" icon={<ArchiveIcon className="w-5 h-5"/>} />
                        <TabButton tab="list" label="قائمة المخزون" icon={<ClipboardListIcon className="w-5 h-5"/>} />
                        <TabButton tab="reorder" label="تقرير نقطة الطلب" icon={<ExclamationTriangleIcon className="w-5 h-5"/>} />
                        <TabButton tab="transfers" label="تحويلات المخزون" icon={<SwitchHorizontalIcon className="w-5 h-5"/>} />
                        <TabButton tab="counts" label="جرد المخزون" icon={<ClipboardCheckIcon className="w-5 h-5"/>} />
                    </nav>
                </div>
                <div>{renderContent()}</div>
            </div>
            {selectedProduct && <ProductInventoryLogModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} logs={inventoryLogs.filter(log => log.productId === selectedProduct.id)} warehouses={warehouses} />}
            {isTransferModalOpen && <InventoryTransferModal isOpen={isTransferModalOpen} onClose={() => setTransferModalOpen(false)} onSave={onSaveInventoryTransfer} products={products} warehouses={warehouses} addNotification={() => {}} />}
        </>
    );
};

export default InventoryManagement;