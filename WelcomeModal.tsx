import React from 'react';
import type { User } from './types';
import { KeyIcon, ShieldCheckIcon } from './Icons';

interface WelcomeModalProps {
  user: User;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ user, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-2xl w-full max-w-lg p-8 relative transform transition-all text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          مرحباً بك، {user.name}!
        </h2>
        <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-6">
            لقد تم إنشاء حسابك بنجاح.
        </p>

        <div className="text-right bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                    <ShieldCheckIcon className="w-5 h-5 text-[var(--primary-color)]" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">دورك الحالي: موظف</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        تم تعيينك بدور "موظف" بشكل افتراضي. هذا الدور يمنحك صلاحيات أساسية لعرض البيانات.
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                 <div className="flex-shrink-0 pt-1">
                    <KeyIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">الحصول على صلاحيات إضافية</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        للوصول إلى المزيد من الميزات مثل إدارة المنتجات، المبيعات، أو التقارير، يرجى التواصل مع مدير النظام في مؤسستك لتعيين الدور المناسب لك.
                    </p>
                </div>
            </div>
        </div>
        
        <div className="mt-8">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full px-6 py-3 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
          >
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
