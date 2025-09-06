import React, { useState } from 'react';
import type { Product } from './types';
import { PrinterIcon } from './Icons';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onPrint: (quantity: number) => void;
}

const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({ isOpen, onClose, product, onPrint }) => {
  const [quantity, setQuantity] = useState(12);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPrint(quantity);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">طباعة باركود المنتج</h2>
        <p className="mb-1 text-sm text-gray-500">المنتج:</p>
        <p className="mb-6 font-semibold text-lg text-gray-900 dark:text-white">{product.name}</p>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="quantity" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">
            عدد الملصقات المطلوب طباعتها
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            min="1"
            max="100"
            required
            className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
          
          <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)]">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">
              <PrinterIcon />
              طباعة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarcodePrintModal;
