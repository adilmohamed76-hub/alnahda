import React, { useState, useEffect } from 'react';
import type { PosShift } from './types';

interface PosShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'start' | 'end';
    activeShift?: PosShift | null;
    onStartShift?: (openingBalance: number) => Promise<void>;
    onEndShift?: (shiftId: number, closingBalance: number) => Promise<PosShift>;
}

const PosShiftModal: React.FC<PosShiftModalProps> = ({ isOpen, onClose, mode, activeShift, onStartShift, onEndShift }) => {
    const [openingBalance, setOpeningBalance] = useState('');
    const [closingBalance, setClosingBalance] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [closedShiftSummary, setClosedShiftSummary] = useState<PosShift | null>(null);
    
    useEffect(() => {
        if (isOpen) {
            setOpeningBalance('');
            setClosingBalance('');
            setIsLoading(false);
            setClosedShiftSummary(null);
        }
    }, [isOpen]);


    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onStartShift) return;
        setIsLoading(true);
        try {
            await onStartShift(parseFloat(openingBalance) || 0);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onEndShift || !activeShift) return;
        setIsLoading(true);
        try {
            const summary = await onEndShift(activeShift.id, parseFloat(closingBalance) || 0);
            setClosedShiftSummary(summary);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LYD' }).format(value);
    };

    if (!isOpen) return null;

    if (closedShiftSummary) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">ملخص فترة العمل</h2>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-700/50"><span>المستخدم:</span><span className="font-bold">{closedShiftSummary.userName}</span></div>
                        <div className="flex justify-between p-2 rounded"><span>الرصيد الافتتاحي:</span><span className="font-semibold">{formatCurrency(closedShiftSummary.openingBalance)}</span></div>
                        <div className="flex justify-between p-2 rounded"><span>مبيعات نقدية:</span><span className="font-semibold text-green-600">{formatCurrency(closedShiftSummary.cashSales)}</span></div>
                        <div className="flex justify-between p-2 rounded"><span>مرتجعات نقدية:</span><span className="font-semibold text-red-600">{formatCurrency(closedShiftSummary.cashReturns)}</span></div>
                        <div className="flex justify-between p-2 rounded"><span>مبيعات بطاقة:</span><span className="font-semibold text-blue-600">{formatCurrency(closedShiftSummary.cardSales)}</span></div>
                        <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-700/50"><span>المبلغ المتوقع بالصندوق:</span><span className="font-bold">{formatCurrency(closedShiftSummary.calculatedCash)}</span></div>
                        <div className="flex justify-between p-2 rounded"><span>المبلغ الفعلي (عند الإغلاق):</span><span className="font-bold">{formatCurrency(closedShiftSummary.closingBalance)}</span></div>
                        <div className={`flex justify-between p-3 rounded font-bold text-lg ${closedShiftSummary.difference === 0 ? 'bg-green-100 dark:bg-green-900/50 text-green-700' : 'bg-red-100 dark:bg-red-900/50 text-red-700'}`}>
                            <span>{closedShiftSummary.difference! >= 0 ? 'الزيادة:' : 'العجز:'}</span>
                            <span>{formatCurrency(Math.abs(closedShiftSummary.difference!))}</span>
                        </div>
                     </div>
                     <button onClick={onClose} className="mt-6 w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">حسنًا</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                {mode === 'start' ? (
                    <form onSubmit={handleStart}>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">بدء فترة عمل جديدة</h2>
                        <label htmlFor="openingBalance" className="block text-sm font-medium mb-2">الرصيد الافتتاحي للصندوق</label>
                        <input
                            type="number"
                            id="openingBalance"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center text-lg font-bold"
                            placeholder="0.00"
                            step="0.01"
                            required
                            autoFocus
                        />
                        <button type="submit" disabled={isLoading} className="mt-6 w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg disabled:bg-gray-400">
                            {isLoading ? 'جاري البدء...' : 'بدء الدوام'}
                        </button>
                    </form>
                ) : (
                     <form onSubmit={handleEnd}>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">إنهاء فترة العمل</h2>
                        <p className="text-center text-sm mb-4">أدخل المبلغ الفعلي الموجود في الصندوق لإغلاق فترة العمل الحالية.</p>
                        <label htmlFor="closingBalance" className="block text-sm font-medium mb-2">المبلغ الفعلي في الصندوق</label>
                        <input
                            type="number"
                            id="closingBalance"
                            value={closingBalance}
                            onChange={(e) => setClosingBalance(e.target.value)}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center text-lg font-bold"
                            placeholder="0.00"
                            step="0.01"
                            required
                            autoFocus
                        />
                         <div className="flex gap-4 mt-6">
                            <button type="button" onClick={onClose} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">إلغاء</button>
                            <button type="submit" disabled={isLoading} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400">
                                {isLoading ? 'جاري الإغلاق...' : 'إنهاء الدوام'}
                            </button>
                         </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PosShiftModal;
