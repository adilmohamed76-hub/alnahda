import React, { useState, useEffect } from 'react';
import { HomeIcon, CubeIcon, SalesIcon, PurchasesIcon, SettingsIcon, LogoutIcon, ShieldCheckIcon, TruckIcon, UsersIcon, WarehouseIcon, TagIcon, KeyIcon, CalculatorIcon, CashRegisterIcon, ArchiveIcon, ReportsIcon, ChevronDownIcon, LightbulbIcon } from './Icons';
import type { View, User, Permission, SystemSettings } from '../types/index';

interface NavLink {
    name: string;
    view?: View;
    icon: React.ReactNode;
    permission?: Permission;
    children?: NavLink[];
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  activeView: View;
  onNavigate: (view: View) => void;
  currentUser: User | null;
  hasPermission: (permission: Permission) => boolean;
  systemSettings: SystemSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, onLogout, activeView, onNavigate, currentUser, hasPermission, systemSettings }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navLinks: NavLink[] = [
    { name: 'الرئيسية', view: 'dashboard', icon: <HomeIcon /> },
    {
      name: 'العمليات',
      icon: <SalesIcon />,
      permission: 'VIEW_SALES',
      children: [
        { name: 'المبيعات', view: 'sales', icon: <SalesIcon />, permission: 'VIEW_SALES' },
        { name: 'نقطة البيع', view: 'pos', icon: <CashRegisterIcon />, permission: 'ACCESS_POS' },
        { name: 'المشتريات', view: 'purchases', icon: <PurchasesIcon />, permission: 'VIEW_PURCHASES' },
      ],
    },
    {
      name: 'الجهات',
      icon: <UsersIcon />,
      permission: 'VIEW_CUSTOMERS',
      children: [
        { name: 'إدارة العملاء', view: 'customers', icon: <UsersIcon />, permission: 'VIEW_CUSTOMERS' },
        { name: 'إدارة الموردين', view: 'suppliers', icon: <TruckIcon />, permission: 'VIEW_SUPPLIERS' },
      ],
    },
    {
      name: 'المخزون',
      icon: <ArchiveIcon />,
      permission: 'VIEW_INVENTORY',
      children: [
        { name: 'إدارة المنتجات', view: 'products', icon: <CubeIcon />, permission: 'VIEW_PRODUCTS' },
        { name: 'إدارة التصنيفات', view: 'categories', icon: <TagIcon />, permission: 'VIEW_CATEGORIES' },
        { name: 'حركة المخزون', view: 'inventory', icon: <ArchiveIcon />, permission: 'VIEW_INVENTORY' },
        { name: 'إدارة المخازن', view: 'warehouses', icon: <WarehouseIcon />, permission: 'VIEW_WAREHOUSES' },
      ],
    },
    {
      name: 'المالية والتقارير',
      icon: <CalculatorIcon />,
      permission: 'VIEW_ACCOUNTING',
      children: [
        { name: 'الحسابات', view: 'accounting', icon: <CalculatorIcon />, permission: 'VIEW_ACCOUNTING' },
        { name: 'التقارير', view: 'reports', icon: <ReportsIcon />, permission: 'VIEW_REPORTS' },
        { name: 'دراسة الجدوى', view: 'feasibility', icon: <LightbulbIcon />, permission: 'VIEW_FEASIBILITY_STUDIES' },
      ],
    },
    {
      name: 'الإدارة',
      icon: <SettingsIcon />,
      permission: 'VIEW_ADMIN',
      children: [
        { name: 'إدارة المستخدمين', view: 'admin', icon: <ShieldCheckIcon />, permission: 'VIEW_ADMIN' },
        { name: 'الصلاحيات', view: 'hr', icon: <KeyIcon />, permission: 'VIEW_HR' },
        { name: 'إعدادات النظام', view: 'settings', icon: <SettingsIcon />, permission: 'MANAGE_SYSTEM_SETTINGS' },
      ],
    },
  ];

  useEffect(() => {
    const activeParent = navLinks.find(link => link.children?.some(child => child.view === activeView));
    if (activeParent) {
      setOpenDropdown(activeParent.name);
    }
  }, [activeView]);

  const handleLinkClick = (view: View) => {
    onNavigate(view);
  };

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name));
  };
  
  const renderLink = (link: NavLink, isChild: boolean = false) => {
    const isActive = activeView === link.view;
    return (
        <a
          key={link.name}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (link.view) {
                handleLinkClick(link.view);
                setSidebarOpen(false);
            }
          }}
          className={`relative flex items-center px-4 py-3 text-md font-medium rounded-lg ${
            isActive
              ? 'bg-blue-500/10 text-[var(--primary-color)]'
              : 'text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:bg-gray-500/5'
          } ${isChild ? 'pr-8' : ''}`}
        >
          {isActive && <span className="absolute right-0 h-6 w-1 bg-[var(--primary-color)] rounded-l-full"></span>}
          {link.icon}
          <span className="mr-3">{link.name}</span>
        </a>
    )
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      <div
        className={`fixed inset-y-0 right-0 z-30 flex flex-col w-64 bg-[var(--card-light)] dark:bg-[var(--card-dark)] shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:border-l lg:border-[var(--border-light)] dark:lg:border-[var(--border-dark)] ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center p-6 border-b border-[var(--border-light)] dark:border-[var(--border-dark)] h-20">
          {systemSettings.companyLogo ? (
            <img src={systemSettings.companyLogo} alt={systemSettings.companyName} className="h-10 object-contain" />
          ) : (
            <>
              <svg className="w-8 h-8 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 21c0-4 .5-6 4-7 3.5 1 4 3 4 7M12 14v-4m0-4l-3-3m3 3l3-3m-3-3V1M9 7l-2-2m3 2l-1-2m5 2l2-2m-3 2l1-2" />
              </svg>
              <span className="mr-3 text-2xl font-bold text-gray-800 dark:text-white">النهضة</span>
            </>
          )}
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks
            .filter(link => !link.permission || hasPermission(link.permission))
            .map((link) => {
              if (link.children) {
                const isDropdownActive = link.children.some(child => child.view === activeView);
                const isOpen = openDropdown === link.name;
                return (
                  <div key={link.name}>
                    <button
                      onClick={() => handleDropdownToggle(link.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-md font-medium rounded-lg ${
                        isDropdownActive && !isOpen
                          ? 'bg-blue-500/5 text-[var(--primary-color)]'
                          : 'text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:bg-gray-500/5'
                      }`}
                    >
                      <div className="flex items-center">
                        {link.icon}
                        <span className="mr-3">{link.name}</span>
                      </div>
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="mt-1 space-y-1 pr-4 border-r-2 border-gray-200 dark:border-gray-700 mr-5">
                        {link.children
                          .filter(child => !child.permission || hasPermission(child.permission))
                          .map(child => renderLink(child, true))
                        }
                      </div>
                    )}
                  </div>
                );
              }
              return renderLink(link);
            })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
