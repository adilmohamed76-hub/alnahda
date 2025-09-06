import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, MenuIcon, SunIcon, MoonIcon, HomeIcon, CubeIcon, SalesIcon, PurchasesIcon, SettingsIcon, LogoutIcon, ShieldCheckIcon, TruckIcon, UsersIcon, WarehouseIcon, TagIcon, KeyIcon, CalculatorIcon, CashRegisterIcon, ArchiveIcon, ReportsIcon, ChevronDownIcon, XIcon, InfoIcon, UserCircleIcon, LightbulbIcon } from './Icons';
import type { User, View, Permission, SystemSettings } from './types';

interface NavLink {
    name: string;
    view?: View;
    icon: React.ReactNode;
    permission?: Permission;
    children?: NavLink[];
}

interface HeaderProps {
  onLogout: () => void;
  activeView: View;
  onNavigate: (view: View) => void;
  currentUser: User | null;
  hasPermission: (permission: Permission) => boolean;
  systemSettings: SystemSettings;
  user: User | null;
  theme: string;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onLogout, activeView, onNavigate, currentUser, hasPermission, systemSettings, 
    user, theme, toggleTheme 
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  const navLinks: NavLink[] = [
    { name: 'الرئيسية', view: 'dashboard', icon: <HomeIcon /> },
    { name: 'العمليات', icon: <SalesIcon />, permission: 'VIEW_SALES', children: [ { name: 'المبيعات', view: 'sales', icon: <SalesIcon />, permission: 'VIEW_SALES' }, { name: 'نقطة البيع', view: 'pos', icon: <CashRegisterIcon />, permission: 'ACCESS_POS' }, { name: 'المشتريات', view: 'purchases', icon: <PurchasesIcon />, permission: 'VIEW_PURCHASES' } ] },
    { name: 'الجهات', icon: <UsersIcon />, permission: 'VIEW_CUSTOMERS', children: [ { name: 'إدارة العملاء', view: 'customers', icon: <UsersIcon />, permission: 'VIEW_CUSTOMERS' }, { name: 'إدارة الموردين', view: 'suppliers', icon: <TruckIcon />, permission: 'VIEW_SUPPLIERS' } ] },
    { name: 'المخزون', icon: <ArchiveIcon />, permission: 'VIEW_INVENTORY', children: [ { name: 'إدارة المنتجات', view: 'products', icon: <CubeIcon />, permission: 'VIEW_PRODUCTS' }, { name: 'إدارة التصنيفات', view: 'categories', icon: <TagIcon />, permission: 'VIEW_CATEGORIES' }, { name: 'حركة المخزون', view: 'inventory', icon: <ArchiveIcon />, permission: 'VIEW_INVENTORY' }, { name: 'إدارة المخازن', view: 'warehouses', icon: <WarehouseIcon />, permission: 'VIEW_WAREHOUSES' } ] },
    { name: 'المالية والتقارير', icon: <CalculatorIcon />, permission: 'VIEW_ACCOUNTING', children: [ { name: 'الحسابات', view: 'accounting', icon: <CalculatorIcon />, permission: 'VIEW_ACCOUNTING' }, { name: 'التقارير', view: 'reports', icon: <ReportsIcon />, permission: 'VIEW_REPORTS' }, { name: 'دراسة الجدوى', view: 'feasibility', icon: <LightbulbIcon />, permission: 'VIEW_FEASIBILITY_STUDIES' } ] },
    { name: 'الإدارة', icon: <SettingsIcon />, permission: 'VIEW_ADMIN', children: [ { name: 'إدارة المستخدمين', view: 'admin', icon: <ShieldCheckIcon />, permission: 'VIEW_ADMIN' }, { name: 'الصلاحيات', view: 'hr', icon: <KeyIcon />, permission: 'VIEW_HR' }, { name: 'إعدادات النظام', view: 'settings', icon: <SettingsIcon />, permission: 'MANAGE_SYSTEM_SETTINGS' } ] },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef, navMenuRef]);

  const handleLinkClick = (view: View) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };
  
  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  const handleMobileSubmenuToggle = (name: string) => {
    setOpenMobileSubmenu(prev => prev === name ? null : name);
  };

  const renderDesktopNav = () => (
    <nav className="hidden lg:flex items-center gap-2" ref={navMenuRef}>
      {navLinks.filter(l => !l.permission || hasPermission(l.permission)).map(link => {
        const isParentActive = link.children?.some(child => child.view === activeView);
        if (link.children) {
          return (
            <div 
              key={link.name} 
              className="relative"
            >
              <button onClick={() => handleDropdownToggle(link.name)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isParentActive ? 'text-[var(--primary-color)] bg-blue-500/10' : 'text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:bg-gray-500/5'}`}>
                {link.name}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {openDropdown === link.name && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-lg shadow-xl border border-[var(--border-light)] dark:border-[var(--border-dark)] py-2 z-50">
                  {link.children.filter(c => !c.permission || hasPermission(c.permission)).map(child => (
                    <a href="#" key={child.view} onClick={(e) => { e.preventDefault(); handleLinkClick(child.view!); }} className={`flex items-center gap-3 px-4 py-2 text-sm ${activeView === child.view ? 'text-[var(--primary-color)] font-bold' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-500/5`}>
                      {child.icon}
                      {child.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return (
          <button key={link.view} onClick={() => handleLinkClick(link.view!)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeView === link.view ? 'text-[var(--primary-color)] bg-blue-500/10' : 'text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:bg-gray-500/5'}`}>
            {link.name}
          </button>
        );
      })}
    </nav>
  );

  const renderMobileNav = () => (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
      <div className={`fixed inset-y-0 right-0 z-50 flex flex-col w-72 bg-[var(--card-light)] dark:bg-[var(--card-dark)] shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)] dark:border-[var(--border-dark)] h-20">
            <h2 className="font-bold text-xl">القائمة</h2>
            <button onClick={() => setIsMobileMenuOpen(false)}><XIcon /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.filter(l => !l.permission || hasPermission(l.permission)).map(link => {
            if (link.children) {
                const isOpen = openMobileSubmenu === link.name;
                return (
                    <div key={link.name}>
                        <button onClick={() => handleMobileSubmenuToggle(link.name)} className="w-full flex items-center justify-between p-3 rounded-lg text-lg hover:bg-gray-500/5">
                            <span className="flex items-center gap-3">{link.icon}{link.name}</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                            <div className="pr-6 mt-1 space-y-1">
                                {link.children.filter(c => !c.permission || hasPermission(c.permission)).map(child => (
                                    <a href="#" key={child.view} onClick={e => { e.preventDefault(); handleLinkClick(child.view!); }} className={`flex items-center gap-3 p-3 rounded-lg text-md ${activeView === child.view ? 'text-[var(--primary-color)] bg-blue-500/10' : ''}`}>
                                        {child.icon}
                                        {child.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
            return (
                <a href="#" key={link.view} onClick={e => { e.preventDefault(); handleLinkClick(link.view!); }} className={`flex items-center gap-3 p-3 rounded-lg text-lg hover:bg-gray-500/5 ${activeView === link.view ? 'text-[var(--primary-color)] bg-blue-500/10' : ''}`}>
                    {link.icon}
                    {link.name}
                </a>
            );
        })}
        </nav>
      </div>
    </div>
  );

  return (
    <header className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] border-b border-[var(--border-light)] dark:border-[var(--border-dark)] shadow-sm sticky top-0 z-40 no-print">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center shrink-0">
                {systemSettings.companyLogo ? (<img src={systemSettings.companyLogo} alt={systemSettings.companyName} className="h-10 object-contain" />) : (<><svg className="w-8 h-8 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 21c0-4 .5-6 4-7 3.5 1 4 3 4 7M12 14v-4m0-4l-3-3m3 3l3-3m-3-3V1M9 7l-2-2m3 2l-1-2m5 2l2-2m-3 2l1-2" /></svg><span className="mr-3 text-2xl font-bold text-gray-800 dark:text-white hidden sm:block">النهضة</span></>)}
            </div>
            {systemSettings.showCompanyNameInHeader && (
              <div className="hidden lg:block overflow-hidden flex-shrink min-w-0 max-w-xs">
                {systemSettings.animateCompanyName ? (
                  <div className="ticker-wrap">
                    <div className="ticker">
                      <span>{systemSettings.companyName}</span>
                    </div>
                  </div>
                ) : (
                  <span className="font-bold text-sm truncate text-gray-700 dark:text-gray-300">{systemSettings.companyName}</span>
                )}
              </div>
            )}
            {renderDesktopNav()}
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 p-2 rounded-full"><span className="sr-only">Toggle theme</span>{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
            <button className="relative text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 p-2 rounded-full"><span className="sr-only">Notifications</span><BellIcon /><span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-[var(--accent-red)] rounded-full">3</span></button>
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2">
                <img className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-[var(--primary-color)]" src={user?.avatar} alt="User Avatar" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-lg shadow-xl border border-[var(--border-light)] dark:border-[var(--border-dark)] py-2 z-50">
                  <div className="px-4 py-3 border-b border-[var(--border-light)] dark:border-[var(--border-dark)]">
                    <p className="font-bold text-gray-800 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{user?.email}</p>
                  </div>
                   <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); setIsUserMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-500/5">
                    <UserCircleIcon />
                    ملفي الشخصي
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); setIsUserMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-500/5">
                    <InfoIcon />
                    عن البرنامج
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-500/5">
                    <LogoutIcon />
                    تسجيل الخروج
                  </a>
                </div>
              )}
            </div>
            <div className="lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 p-2 rounded-full"><span className="sr-only">Open menu</span><MenuIcon /></button>
            </div>
          </div>
        </div>
      </div>
      {renderMobileNav()}
    </header>
  );
};

export default Header;