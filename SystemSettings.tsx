import React, { useState, useEffect, useRef } from 'react';
import type { SystemSettings, Permission } from './types';
import { UploadIcon } from './Icons';

interface SystemSettingsProps {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
  hasPermission: (permission: Permission) => boolean;
}

const SystemSettingsComponent: React.FC<SystemSettingsProps> = ({ settings, onSave, hasPermission }) => {
  const [formData, setFormData] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value as SystemSettings['fontSize']}));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Simulate upload and get URL by setting a new placeholder URL
      const newLogoUrl = 'https://i.imgur.com/3Z9wL9c.png';
      setFormData(prev => ({ ...prev, companyLogo: newLogoUrl }));
    }
  };

  const canManage = hasPermission('MANAGE_SYSTEM_SETTINGS');

  if (!canManage) {
    return (
      <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
        <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }

  return (
    <>
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إعدادات النظام</h1>
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div>
          <h3 className="text-lg font-semibold border-b border-[var(--border-light)] dark:border-[var(--border-dark)] pb-2 mb-4 text-gray-800 dark:text-white">الإعدادات العامة للشركة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">اسم الشركة</label>
              <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} disabled={!canManage} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md disabled:opacity-70" />
            </div>
            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">العنوان</label>
              <input type="text" name="companyAddress" id="companyAddress" value={formData.companyAddress} onChange={handleChange} disabled={!canManage} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md disabled:opacity-70" />
            </div>
            <div>
              <label htmlFor="companyPhone" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">الهاتف</label>
              <input type="text" name="companyPhone" id="companyPhone" value={formData.companyPhone} onChange={handleChange} disabled={!canManage} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md disabled:opacity-70" />
            </div>
            <div>
              <label htmlFor="companyEmail" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">البريد الإلكتروني</label>
              <input type="email" name="companyEmail" id="companyEmail" value={formData.companyEmail} onChange={handleChange} disabled={!canManage} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md disabled:opacity-70" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="companyLogo" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">شعار الشركة</label>
              <div className="flex items-center gap-2">
                <input 
                  type="url" 
                  name="companyLogo" 
                  id="companyLogo" 
                  placeholder="https://example.com/logo.png"
                  value={formData.companyLogo} 
                  onChange={handleChange} 
                  disabled={!canManage} 
                  className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md disabled:opacity-70 font-mono text-left" 
                  dir="ltr"
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
                <button 
                  type="button" 
                  onClick={handleLogoUploadClick} 
                  disabled={!canManage}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadIcon />
                  <span>رفع</span>
                </button>
                {formData.companyLogo && <img src={formData.companyLogo} alt="معاينة الشعار" className="h-10 w-auto object-contain bg-gray-200 dark:bg-gray-700 rounded-md p-1" />}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                يمكنك رفع صورة من جهازك (سيتم استخدام رابط مؤقت) أو لصق رابط مباشر للصورة.
              </p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div>
          <h3 className="text-lg font-semibold border-b border-[var(--border-light)] dark:border-[var(--border-dark)] pb-2 mb-4 text-gray-800 dark:text-white">المظهر والإعدادات العامة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">اللون الأساسي</label>
              <div className="flex items-center gap-2">
                 <input type="color" name="primaryColor" id="primaryColor" value={formData.primaryColor || '#3b82f6'} onChange={handleChange} disabled={!canManage} className="w-12 h-10 p-1 bg-transparent border-none rounded-md disabled:opacity-70" style={{'--webkit-appearance': 'none'} as React.CSSProperties} />
                 <input type="text" value={formData.primaryColor || '#3b82f6'} onChange={handleChange} disabled={!canManage} name="primaryColor" className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md disabled:opacity-70 font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">حجم الخط العام</label>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                {(['sm', 'base', 'lg'] as const).map(size => (
                  <label key={size} className={`flex-1 text-center px-2 py-1 rounded-md cursor-pointer transition-colors ${formData.fontSize === size ? 'bg-[var(--primary-color)] text-white shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    <input 
                      type="radio" 
                      name="fontSize" 
                      value={size}
                      checked={formData.fontSize === size}
                      onChange={handleRadioChange}
                      disabled={!canManage}
                      className="sr-only"
                    />
                    <span>{size === 'sm' ? 'صغير' : size === 'lg' ? 'كبير' : 'متوسط'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
                 <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                    <label htmlFor="showCompanyNameInHeader" className="font-medium text-gray-800 dark:text-gray-200">إظهار اسم الشركة في الشريط العلوي</label>
                    <input 
                        type="checkbox" 
                        name="showCompanyNameInHeader" 
                        id="showCompanyNameInHeader"
                        checked={formData.showCompanyNameInHeader ?? true} 
                        onChange={handleCheckboxChange} 
                        disabled={!canManage}
                        className="h-6 w-6 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                    </div>
            </div>
             <div className="md:col-span-2">
                <div className={`flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg transition-opacity ${formData.showCompanyNameInHeader ?? true ? 'opacity-100' : 'opacity-50'}`}>
                    <label htmlFor="animateCompanyName" className="font-medium text-gray-800 dark:text-gray-200">تحريك اسم الشركة (شريط متحرك)</label>
                    <input 
                        type="checkbox" 
                        name="animateCompanyName" 
                        id="animateCompanyName"
                        checked={formData.animateCompanyName ?? false} 
                        onChange={handleCheckboxChange} 
                        disabled={!canManage || !(formData.showCompanyNameInHeader ?? true)}
                        className="h-6 w-6 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                </div>
            </div>
          </div>
        </div>
        
        {/* Financial Settings */}
        <div>
          <h3 className="text-lg font-semibold border-b border-[var(--border-light)] dark:border-[var(--border-dark)] pb-2 mb-4 text-gray-800 dark:text-white">الإعدادات المالية</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vatRate" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">نسبة ضريبة القيمة المضافة (%)</label>
                <input type="number" name="vatRate" id="vatRate" value={formData.vatRate} onChange={handleChange} disabled={!canManage} min="0" step="0.1" className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md disabled:opacity-70" />
              </div>
          </div>
        </div>
        
        {/* POS Settings */}
        <div>
          <h3 className="text-lg font-semibold border-b border-[var(--border-light)] dark:border-[var(--border-dark)] pb-2 mb-4 text-gray-800 dark:text-white">إعدادات نقطة البيع</h3>
          <div>
              <label htmlFor="posReceiptFooter" className="block text-sm font-medium text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">رسالة تذييل الإيصال</label>
              <textarea name="posReceiptFooter" id="posReceiptFooter" value={formData.posReceiptFooter} onChange={handleChange} disabled={!canManage} rows={2} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md disabled:opacity-70"></textarea>
          </div>
        </div>
        
        {canManage && (
          <div className="flex justify-end pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)]">
            <button type="submit" className="px-6 py-2 bg-[var(--primary-color)] text-white font-semibold rounded-lg hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]">
              حفظ الإعدادات
            </button>
          </div>
        )}
      </form>
    </div>
    </>
  );
};

export default SystemSettingsComponent;