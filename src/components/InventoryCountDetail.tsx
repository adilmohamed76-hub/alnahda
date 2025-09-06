import React, { useState, useEffect, useMemo } from 'react';
import type { InventoryCount, InventoryCountItem, Warehouse, Product } from './types';
import ConfirmationModal from './ConfirmationModal';

interface InventoryCountDetailProps {
  count: InventoryCount | null;
  warehouseId: number | null;
  warehouses: Warehouse[];
  products: Product[];
  onPost: (count: InventoryCount) => void;
  onBack: () => void;
}

const InventoryCountDetail: React.FC<InventoryCountDetailProps> = ({ count, warehouseId, warehouses, products, onPost, onBack }) => {
  const [items, setItems] = useState<InventoryCountItem[]>([]);
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (count) {
      setItems(count.items);
    } else if (warehouseId) {
      const warehouseProducts = products
        .map(p => ({
          product: p,
          stock: p.stockLocations.find(sl => sl.warehouseId === warehouseId)?.quantity || 0,
        }))
        .filter(p => p.stock > 0);
        
      const initialItems: InventoryCountItem[] = warehouseProducts.map(({product, stock}) => ({
        productId: product.id,
        productName: product.name,
        systemQty: stock,
        countedQty: null,
        variance: 0,
      }));
      setItems(initialItems);
    }
  }, [count, warehouseId, products]);

  const { countedItems, totalItems, progressPercentage } = useMemo(() => {
    const totalItems = items.length;
    if (totalItems === 0) {
      return { countedItems: 0, totalItems: 0, progressPercentage: 100 };
    }
    const countedItems = items.filter(item => item.countedQty !== null).length;
    const progressPercentage = Math.round((countedItems / totalItems) * 100);
    return { countedItems, totalItems, progressPercentage };
  }, [items]);

  const handleQuantityChange = (productId: number, value: string) => {
    const counted = parseInt(value, 10);
    setItems(prevItems => prevItems.map(item => {
      if (item.productId === productId) {
        const countedQty = isNaN(counted) ? null : counted;
        return {
          ...item,
          countedQty,
          variance: countedQty !== null ? countedQty - item.systemQty : 0,
        };
      }
      return item;
    }));
  };

  const handleConfirmPost = () => {
    const finalCount: InventoryCount = {
        id: count?.id || Date.now(),
        date: count?.date || new Date().toISOString(),
        warehouseId: count?.warehouseId || warehouseId!,
        status: 'مسودة', // Will be set to 'Posted' by handler
        items: items.map(i => ({...i, countedQty: i.countedQty ?? i.systemQty })) // If not counted, assume no change
    };
    onPost(finalCount);
    setConfirmOpen(false);
  };
  
  const currentWarehouse = warehouses.find(w => w.id === (count?.warehouseId || warehouseId));
  const isPosted = count?.status === 'معتمد';

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-blue-600 hover:underline">&larr; العودة إلى قائمة الجرد</button>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isPosted ? 'تفاصيل الجرد' : count ? 'إكمال عملية الجرد' : 'بدء جرد جديد'}
          </h2>
          <p className="text-gray-500">المخزن: <span className="font-semibold">{currentWarehouse?.name}</span></p>
        </div>
        {!isPosted && (
             <button onClick={() => setConfirmOpen(true)} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg">
                اعتماد وتسوية الجرد
            </button>
        )}
      </div>

      {!isPosted && (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    تقدم الجرد: {countedItems} / {totalItems} صنف
                </span>
                <span className="text-sm font-bold text-[var(--primary-color)]">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                    className="bg-[var(--primary-color)] h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}>
                </div>
            </div>
        </div>
      )}

      <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full text-sm text-right">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-2">المنتج</th>
              <th className="px-4 py-2">الكمية بالنظام</th>
              <th className="px-4 py-2">الكمية الفعلية</th>
              <th className="px-4 py-2">الفرق</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.productId} className="border-b dark:border-gray-700">
                <td className="px-4 py-2 font-medium">{item.productName}</td>
                <td className="px-4 py-2 text-center">{item.systemQty}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.countedQty ?? ''}
                    onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                    className="w-24 p-1 bg-gray-100 dark:bg-gray-800 rounded text-center disabled:bg-gray-200"
                    placeholder="أدخل العدد"
                    disabled={isPosted}
                    aria-label={`الكمية الفعلية لـ ${item.productName}`}
                  />
                </td>
                <td className={`px-4 py-2 text-center font-bold ${item.variance > 0 ? 'text-green-500' : item.variance < 0 ? 'text-red-500' : ''}`}>
                  {item.variance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {isConfirmOpen && (
        <ConfirmationModal
            isOpen={isConfirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleConfirmPost}
            title="تأكيد اعتماد الجرد"
            message={`هل أنت متأكد من اعتماد هذه التسوية؟ سيتم تحديث كميات المخزون وإنشاء قيد محاسبي بالفروقات. لا يمكن التراجع عن هذا الإجراء.`}
        />
      )}
    </div>
  );
};

export default InventoryCountDetail;