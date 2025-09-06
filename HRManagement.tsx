import React from 'react';
import type { UserRole, Permission, RolePermissions } from './types';
import { KeyIcon } from './Icons';

interface HRManagementProps {
  rolePermissions: RolePermissions;
  onUpdate: (role: UserRole, permission: Permission, checked: boolean) => void;
  hasPermission: (permission: Permission) => boolean;
}

const allRoles: UserRole[] = ['مدير النظام', 'مدير مبيعات', 'مسؤول مشتريات', 'مدير مخزون', 'أخصائي موارد بشرية', 'موظف'];

const allPermissions: { id: Permission, label: string, group: string }[] = [
    { id: 'VIEW_PRODUCTS', label: 'عرض المنتجات', group: 'المنتجات والتصنيفات' },
    { id: 'MANAGE_PRODUCTS', label: 'إدارة المنتجات (إضافة/تعديل)', group: 'المنتجات والتصنيفات' },
    { id: 'DELETE_PRODUCTS', label: 'حذف المنتجات', group: 'المنتجات والتصنيفات' },
    { id: 'VIEW_CATEGORIES', label: 'عرض التصنيفات', group: 'المنتجات والتصنيفات' },
    { id: 'MANAGE_CATEGORIES', label: 'إدارة التصنيفات', group: 'المنتجات والتصنيفات' },
    
    { id: 'VIEW_SUPPLIERS', label: 'عرض الموردين', group: 'الموردون والعملاء' },
    { id: 'MANAGE_SUPPLIERS', label: 'إدارة الموردين', group: 'الموردون والعملاء' },
    { id: 'DELETE_SUPPLIERS', label: 'حذف الموردين', group: 'الموردون والعملاء' },
    { id: 'VIEW_CUSTOMERS', label: 'عرض العملاء', group: 'الموردون والعملاء' },
    { id: 'MANAGE_CUSTOMERS', label: 'إدارة العملاء', group: 'الموردون والعملاء' },
    { id: 'DELETE_CUSTOMERS', label: 'حذف العملاء', group: 'الموردون والعملاء' },

    { id: 'VIEW_SALES', label: 'عرض المبيعات', group: 'المبيعات والمشتريات' },
    { id: 'CREATE_SALES_ORDERS', label: 'إنشاء فواتير مبيعات', group: 'المبيعات والمشتريات' },
    { id: 'MANAGE_SALES_ORDERS', label: 'تعديل وتحديث حالة المبيعات', group: 'المبيعات والمشتريات' },
    { id: 'ACCESS_POS', label: 'الوصول إلى نقطة البيع', group: 'المبيعات والمشتريات' },
    { id: 'VIEW_PURCHASES', label: 'عرض المشتريات', group: 'المبيعات والمشتريات' },
    { id: 'CREATE_PURCHASE_ORDERS', label: 'إنشاء أوامر شراء', group: 'المبيعات والمشتريات' },
    { id: 'MANAGE_PURCHASE_ORDERS', label: 'تعديل وتحديث حالة المشتريات', group: 'المبيعات والمشتريات' },

    { id: 'VIEW_INVENTORY', label: 'عرض المخزون', group: 'المخزون والمخازن' },
    { id: 'MANAGE_INVENTORY_TRANSFERS', label: 'إدارة تحويلات المخزون', group: 'المخزون والمخازن' },
    { id: 'MANAGE_INVENTORY_COUNTS', label: 'إدارة عمليات الجرد', group: 'المخزون والمخازن' },
    { id: 'VIEW_WAREHOUSES', label: 'عرض المخازن', group: 'المخزون والمخازن' },
    { id: 'MANAGE_WAREHOUSES', label: 'إدارة المخازن', group: 'المخزون والمخازن' },

    { id: 'VIEW_ACCOUNTING', label: 'عرض الحسابات', group: 'الحسابات والمالية' },
    { id: 'MANAGE_CHART_OF_ACCOUNTS', label: 'إدارة شجرة الحسابات', group: 'الحسابات والمالية' },
    { id: 'CREATE_JOURNAL_ENTRIES', label: 'إنشاء قيود يدوية', group: 'الحسابات والمالية' },
    { id: 'CLOSE_FINANCIAL_PERIODS', label: 'إغلاق الفترات المالية', group: 'الحسابات والمالية' },
    
    { id: 'VIEW_HR', label: 'عرض الموارد البشرية', group: 'النظام والإدارة' },
    { id: 'MANAGE_PERMISSIONS', label: 'إدارة الصلاحيات', group: 'النظام والإدارة' },
    { id: 'VIEW_ADMIN', label: 'عرض إدارة النظام', group: 'النظام والإدارة' },
    { id: 'MANAGE_USERS', label: 'إدارة المستخدمين', group: 'النظام والإدارة' },
    { id: 'MANAGE_SYSTEM_SETTINGS', label: 'إدارة إعدادات النظام', group: 'النظام والإدارة' },
];

const HRManagement: React.FC<HRManagementProps> = ({ rolePermissions, onUpdate, hasPermission }) => {
  if (!hasPermission('VIEW_HR')) {
    return (
      <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
        <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }

  const canManage = hasPermission('MANAGE_PERMISSIONS');

  const groupedPermissions = allPermissions.reduce((acc, p) => {
    acc[p.group] = acc[p.group] || [];
    acc[p.group].push(p);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة الصلاحيات والأدوار</h1>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-right text-gray-500 dark:text-gray-400 border-collapse">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 sticky right-0 bg-gray-50 dark:bg-gray-700">الصلاحية</th>
                {allRoles.map(role => (
                  <th key={role} scope="col" className="px-6 py-3 text-center">{role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([group, permissions]) => (
                <React.Fragment key={group}>
                  <tr className="bg-gray-100 dark:bg-gray-900/50">
                    <td colSpan={allRoles.length + 1} className="px-4 py-2 font-bold text-gray-800 dark:text-gray-200">{group}</td>
                  </tr>
                  {permissions.map(permission => (
                    <tr key={permission.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white sticky right-0 bg-white dark:bg-gray-800">
                        {permission.label}
                      </th>
                      {allRoles.map(role => (
                        <td key={`${role}-${permission.id}`} className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                            checked={rolePermissions[role]?.includes(permission.id) || false}
                            onChange={(e) => onUpdate(role, permission.id, e.target.checked)}
                            disabled={!canManage || role === 'مدير النظام'}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default HRManagement;