import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, MenuIcon, SunIcon, MoonIcon, InfoIcon, UserCircleIcon, LogoutIcon } from './Icons';
import type { User, SystemSettings } from '../types/index';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  currentUser: User | null;
  theme: string;
  toggleTheme: () => void;
  systemSettings: SystemSettings;
}

const Header: React.FC<HeaderProps> = ({ 
    setSidebarOpen, onLogout, currentUser, theme, toggleTheme, systemSettings
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);

  return (
    <header className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] border-b border-[var(--border-light)] dark:border-[var(--border-dark)] shadow-sm sticky top-0 z-10 no-print">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side: Mobile menu button and Company Name Ticker */}
          <div className="flex items-center gap-4">
             <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
             >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" />
            </button>

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
          </div>
          
          {/* Right side: Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 p-2 rounded-full"><span className="sr-only">Toggle theme</span>{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
            <button className="relative text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 p-2 rounded-full"><span className="sr-only">Notifications</span><BellIcon /><span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-[var(--accent-red)] rounded-full">3</span></button>
            
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2">
                <img className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-[var(--primary-color)]" src={currentUser?.avatar} alt="User Avatar" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-lg shadow-xl border border-[var(--border-light)] dark:border-[var(--border-dark)] py-2 z-50">
                  <div className="px-4 py-3 border-b border-[var(--border-light)] dark:border-[var(--border-dark)]">
                    <p className="font-bold text-gray-800 dark:text-white">{currentUser?.name}</p>
                    <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{currentUser?.email}</p>
                  </div>
                   <a href="#" className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-500/5">
                    <UserCircleIcon />
                    ملفي الشخصي
                  </a>
                  <a href="#" className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-500/5">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
