import React from 'react';
import { LinkIcon, QrCodeIcon, CheckCircleIcon } from './Icons';

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentLink: string;
}

const PaymentLinkModal: React.FC<PaymentLinkModalProps> = ({ isOpen, onClose, paymentLink }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentLink)}`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
            <LinkIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">تم إنشاء رابط الدفع بنجاح</h2>
        <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-6">
          شارك هذا الرابط أو رمز الاستجابة السريعة مع العميل لإتمام عملية الدفع.
        </p>

        <div className="flex justify-center mb-6">
            <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48 rounded-lg border-4 border-white dark:border-gray-700" />
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            readOnly
            value={paymentLink}
            className="w-full p-3 pr-24 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-center font-mono"
          />
          <button 
            onClick={handleCopy}
            className="absolute left-1 top-1 bottom-1 flex items-center gap-2 px-3 bg-[var(--primary-color)] text-white text-xs font-bold rounded-md"
          >
            {copied ? <CheckCircleIcon /> : <LinkIcon className="w-4 h-4" />}
            {copied ? 'تم النسخ!' : 'نسخ'}
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

export default PaymentLinkModal;