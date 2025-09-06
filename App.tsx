

import React, { useState, useEffect } from 'react';
import Header from './Header';
import DashboardCard from './DashboardCard';
import SalesChart from './SalesChart';
import RecentActivities from './RecentActivities';
import AiAssistant from './AiAssistant';
import AuthScreen from './AuthScreen';
import TeamMembers from './TeamMembers';
import NotificationToast from './NotificationToast';
import ProductManagement from './ProductManagement';
import SupplierManagement from './SupplierManagement';
import PurchaseManagement from './PurchaseManagement';
import SalesManagement from './SalesManagement';
import CustomerManagement from './CustomerManagement';
import SystemAdmin from './SystemAdmin';
import InventoryManagement from './InventoryManagement';
import WarehouseManagement from './WarehouseManagement';
import CategoryManagement from './CategoryManagement';
import HRManagement from './HRManagement';
import ReportsManagement from './ReportsManagement';
import AccountingManagement from './AccountingManagement';
import PointOfSale from './PointOfSale';
import SystemSettings from './SystemSettings';
import About from './About';
import UserProfile from './UserProfile';
import type { Currency, User, Notification, View, Product, Supplier, PurchaseOrder, SalesOrder, Customer, InventoryLog, Warehouse, InventoryTransfer, ProductCategory, RolePermissions, Permission, UserRole, Account, JournalEntry, SystemSettings as SystemSettingsType, InventoryCount, FinancialPeriod, FeasibilityStudy, FeasibilityStudyItem, PosShift } from './types';
import * as apiService from './apiService';
import WelcomeModal from './WelcomeModal';
import TopSellingProducts from './TopSellingProducts';
import SalesByCategoryChart from './SalesByCategoryChart';
import InventoryDistributionChart from './InventoryDistributionChart';
import BarcodePrintSheet from './BarcodePrintSheet';
import FeasibilityStudyManagement from './FeasibilityStudyManagement';


// Import Icons
import { UsersIcon, ShoppingCartIcon, DollarSignIcon, ArchiveIcon } from './Icons';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  // Data State - now fetched from backend
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventoryTransfers, setInventoryTransfers] = useState<InventoryTransfer[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({} as RolePermissions);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettingsType | null>(null);
  const [financialPeriods, setFinancialPeriods] = useState<FinancialPeriod[]>([]);
  const [barcodePrintJob, setBarcodePrintJob] = useState<{ product: Product; quantity: number } | null>(null);
  const [feasibilityStudies, setFeasibilityStudies] = useState<FeasibilityStudy[]>([]);
  const [activeShift, setActiveShift] = useState<PosShift | null>(null);
  
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Fetch all data from backend on initial load
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !currentUser) {
          setIsLoading(false);
          return;
      }
      try {
        setIsLoading(true);
        const data = await apiService.fetchAllData();
        setUsers(data.users || []);
        setProducts(data.products || []);
        setSuppliers(data.suppliers || []);
        setPurchaseOrders(data.purchaseOrders || []);
        setCustomers(data.customers || []);
        setSalesOrders(data.salesOrders || []);
        setWarehouses(data.warehouses || []);
        setProductCategories(data.productCategories || []);
        setRolePermissions(data.rolePermissions || {});
        setAccounts(data.accounts || []);
        setFinancialPeriods(data.financialPeriods || []);
        setSystemSettings(data.systemSettings || null);
        
        if (hasPermission('ACCESS_POS')) {
            const shift = await apiService.getActiveShift(currentUser.id);
            setActiveShift(shift);
        }

        // Mock data that isn't in DB yet
        setInventoryLogs(data.inventoryLogs || []);
        setInventoryTransfers(data.inventoryTransfers || []);
        setInventoryCounts(data.inventoryCounts || []);
        setJournalEntries(data.journalEntries || []);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        addNotification({type: 'error', title: 'فشل الاتصال', message: 'لا يمكن الاتصال بالخادم. تأكد من تشغيله.'});
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, currentUser]);


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('currentUser');
    if (token && userJson) {
      setCurrentUser(JSON.parse(userJson));
      setIsAuthenticated(true);
    } else {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    if (!systemSettings) return;
    const root = window.document.documentElement;
    const darkenColor = (hex: string, percent: number) => {
        if (!hex || !hex.startsWith('#') || hex.length !== 7) return '#2563eb'; // fallback
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        const toHex = (c: number) => ('0' + c.toString(16)).slice(-2);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    if (systemSettings.primaryColor) {
        root.style.setProperty('--primary-color', systemSettings.primaryColor);
        root.style.setProperty('--primary-color-hover', darkenColor(systemSettings.primaryColor, 15));
    }

    if (systemSettings.fontSize) {
        if (systemSettings.fontSize === 'sm') {
            root.style.fontSize = '14px';
        } else if (systemSettings.fontSize === 'lg') {
            root.style.fontSize = '18px';
        } else {
            root.style.fontSize = '16px';
        }
    }
  }, [systemSettings]);
  
  useEffect(() => {
    if (barcodePrintJob) {
        const handleAfterPrint = () => {
            setBarcodePrintJob(null);
            document.body.classList.remove('printing-barcodes-body');
        };

        window.addEventListener('afterprint', handleAfterPrint);
        
        // Timeout to allow component to render before triggering print
        setTimeout(() => {
            document.body.classList.add('printing-barcodes-body');
            window.print();
        }, 100);

        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
            // Fallback for browsers that don't fire afterprint consistently
            if (document.body.classList.contains('printing-barcodes-body')) {
                 handleAfterPrint();
            }
        };
    }
}, [barcodePrintJob]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'link'>) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
 const handleLogin = async (email: string, password?: string) => {
    try {
        const { user, token } = await apiService.authenticateUser(email, password || '');
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsNewUser(false);
    } catch (error) {
        throw error;
    }
  };

  const handleRegister = async (name: string, email: string, password: string, phone: string) => {
    try {
        const { user, token } = await apiService.registerUser(name, email, password, phone);
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsNewUser(true);
        setUsers(prevUsers => [...prevUsers, user]);
        addNotification({ type: 'success', title: 'تم إنشاء الحساب بنجاح', message: `مرحباً بك، ${user.name}!` });
    } catch (error) {
        throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  const handleSaveProduct = async (productData: Omit<Product, 'id'> & { id?: number }): Promise<Product> => {
    try {
        const savedProduct = await apiService.saveProduct(productData);
        if (productData.id) {
            setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
            addNotification({ type: 'success', title: 'تم التحديث', message: `تم تحديث المنتج "${savedProduct.name}" بنجاح.` });
        } else {
            setProducts(prev => [...prev, savedProduct]);
            addNotification({ type: 'success', title: 'تمت الإضافة', message: `تمت إضافة منتج جديد: "${savedProduct.name}".` });
        }
        return savedProduct;
    } catch (error) {
        addNotification({ type: 'error', title: 'خطأ', message: 'فشل حفظ المنتج.' });
        throw error;
    }
  };
  
  const handleDeleteProduct = async (productId: number) => {
    const productToDelete = products.find(p => p.id === productId);
    if (productToDelete) {
        try {
            await apiService.deleteProduct(productId);
            setProducts(products.filter(p => p.id !== productId));
            addNotification({ type: 'error', title: 'تم الحذف', message: `تم حذف المنتج "${productToDelete.name}".` });
        } catch (error) {
            addNotification({ type: 'error', title: 'خطأ', message: 'فشل حذف المنتج.' });
        }
    }
  };

  const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id'> & { id?: number }) => {
    try {
        const savedSupplier = await apiService.saveSupplier(supplierData);
        if (supplierData.id) {
            setSuppliers(suppliers.map(s => s.id === savedSupplier.id ? savedSupplier : s));
            addNotification({ type: 'success', title: 'تم التحديث', message: `تم تحديث بيانات المورد "${savedSupplier.name}".` });
        } else {
            setSuppliers([...suppliers, savedSupplier]);
            addNotification({ type: 'success', title: 'تمت الإضافة', message: `تمت إضافة مورد جديد: "${savedSupplier.name}".` });
        }
    } catch (error) {
        addNotification({ type: 'error', title: 'خطأ', message: 'فشل حفظ المورد.' });
    }
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    const supplierToDelete = suppliers.find(s => s.id === supplierId);
    if (supplierToDelete) {
        try {
            await apiService.deleteSupplier(supplierId);
            setSuppliers(suppliers.filter(s => s.id !== supplierId));
            addNotification({ type: 'error', title: 'تم الحذف', message: `تم حذف المورد "${supplierToDelete.name}".` });
        } catch(e){
             addNotification({ type: 'error', title: 'خطأ', message: 'فشل حذف المورد.' });
        }
    }
  };

    const handleSaveSalesOrder = async (soData: Omit<SalesOrder, 'id'> & { id?: number }): Promise<SalesOrder> => {
    try {
        const savedOrder = await apiService.saveSalesOrder(soData);
        if (soData.id) {
            setSalesOrders(salesOrders.map(s => s.id === savedOrder.id ? savedOrder : s));
            addNotification({ type: 'success', title: 'تم التحديث', message: `تم تحديث فاتورة المبيعات ${savedOrder.soNumber}.`});
        } else {
            setSalesOrders([...salesOrders, savedOrder]);
            addNotification({ type: 'success', title: 'تم الإنشاء', message: `تم إنشاء فاتورة المبيعات ${savedOrder.soNumber}.`});
        }
        return savedOrder;
    } catch (error) {
         addNotification({ type: 'error', title: 'خطأ', message: 'فشل حفظ الفاتورة.' });
         throw error;
    }
  };
  
    const handleUpdateSOStatus = async (soId: number, status: SalesOrder['status']) => {
        try {
            await apiService.updateSalesOrderStatus(soId, status);
            const soToUpdate = salesOrders.find(so => so.id === soId);
            if (soToUpdate) {
                // To reflect the change immediately and trigger stock updates, we'll refetch products
                const updatedProducts = await apiService.fetchProducts();
                setProducts(updatedProducts);
                setSalesOrders(salesOrders.map(so => so.id === soId ? {...so, status} : so));
                addNotification({ type: 'info', title: 'تحديث الحالة', message: `تم تحديث حالة الفاتورة ${soToUpdate.soNumber} إلى ${status}.`});
            }
        } catch(e) {
            addNotification({ type: 'error', title: 'خطأ', message: 'فشل تحديث حالة الفاتورة.' });
        }
    };
  
  const handleUpdateUserProfile = async (userData: Pick<User, 'id' | 'name' | 'avatar' | 'phone'>): Promise<User> => {
    try {
        const updatedUser = await apiService.updateUserProfile(userData);
        // Update current user state
        setCurrentUser(updatedUser);
        // Update user in the main users list
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        addNotification({ type: 'success', title: 'تم التحديث', message: 'تم تحديث ملفك الشخصي بنجاح.' });
        return updatedUser;
    } catch (error) {
        addNotification({ type: 'error', title: 'خطأ', message: 'فشل تحديث الملف الشخصي.' });
        throw error;
    }
  };

  const handleChangePassword = async (userId: number, currentPassword, newPassword) => {
    try {
        await apiService.changePassword(userId, currentPassword, newPassword);
        addNotification({ type: 'success', title: 'تم بنجاح', message: 'تم تغيير كلمة المرور بنجاح.'});
    } catch (error) {
        addNotification({ type: 'error', title: 'خطأ', message: (error as Error).message });
        throw error;
    }
  };

   const handleSavePurchaseOrder = (poData: Omit<PurchaseOrder, 'id'> & { id?: number }) => {};
   const handleUpdatePOStatus = (poId: number, status: PurchaseOrder['status']) => {};
   const handleSaveCustomer = async (customerData: Omit<Customer, 'id'> & { id?: number }): Promise<Customer> => {
        const savedCustomer = await apiService.saveCustomer(customerData);
        if(customerData.id) {
            setCustomers(customers.map(c => c.id === savedCustomer.id ? savedCustomer : c));
        } else {
            setCustomers(prev => [...prev, savedCustomer]);
        }
        return savedCustomer;
   };
   const handleDeleteCustomer = async (customerId: number) => {
        await apiService.deleteCustomer(customerId);
        setCustomers(customers.filter(c => c.id !== customerId));
   };
   const handleUpdateUser = async (updatedUser: Pick<User, 'id' | 'name' | 'role' | 'status'>) => {
    try {
        const savedUser = await apiService.updateUser(updatedUser);
        setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
        addNotification({ type: 'success', title: 'تم التحديث', message: `تم تحديث بيانات المستخدم "${savedUser.name}".` });
    } catch (error) {
        addNotification({ type: 'error', title: 'خطأ', message: 'فشل تحديث المستخدم.' });
    }
   };
   const handleAddUser = async (userData: Omit<User, 'id' | 'avatar' | 'status' | 'email'> & { email: string, password: string, role: UserRole }) => {
    try {
        const newUser = await apiService.createUser(userData);
        setUsers(prevUsers => [...prevUsers, newUser]);
        addNotification({ type: 'success', title: 'تم الإنشاء', message: `تم إنشاء حساب للمستخدم "${newUser.name}" بنجاح.` });
    } catch (error) {
        addNotification({ type: 'error', title: 'خطأ', message: (error as Error).message });
        throw error; // Re-throw to be caught in the modal
    }
   };
   const handleDeleteUser = (userId: number) => {};
   const handleSaveWarehouse = (warehouseData: Omit<Warehouse, 'id'> & { id?: number }) => {};
   const handleDeleteWarehouse = (warehouseId: number) => {};
   const handleSaveInventoryTransfer = (transferData: Omit<InventoryTransfer, 'id'>) => {};
   const handleSaveCategory = (categoryData: Omit<ProductCategory, 'id'> & { id?: number }) => {};
   const handleDeleteCategory = (categoryId: number) => {};
   const handleUpdateRolePermissions = (role: UserRole, permission: Permission, checked: boolean) => {};
   const handleSaveAccount = (accountData: Omit<Account, 'id' | 'balance'> & { id?: number }) => {};
   const createJournalEntry = (entryData: Omit<JournalEntry, 'id'>) => {};
   const handleUpdateSystemSettings = async (settings: SystemSettingsType) => {
    try {
        const updatedSettings = await apiService.updateSystemSettings(settings);
        setSystemSettings(updatedSettings);
        addNotification({ type: 'success', title: 'تم الحفظ', message: 'تم تحديث إعدادات النظام بنجاح.' });
    } catch (error) {
        addNotification({ type: 'error', title: 'خطأ', message: 'فشل حفظ إعدادات النظام.' });
    }
   };
   const handlePostInventoryCount = (count: InventoryCount) => {};
   const handleClosePeriod = (periodId: number) => {};
   const handlePrintBarcodes = (product: Product, quantity: number) => {
    setBarcodePrintJob({ product, quantity });
  };
   
    const handleCreateFeasibilityStudy = (source: PurchaseOrder | 'inventory') => {
        let newStudy: FeasibilityStudy;

        if (source === 'inventory') {
            const studyItems: FeasibilityStudyItem[] = products
                .map(p => {
                    const quantity = p.stockLocations.reduce((sum, loc) => sum + loc.quantity, 0);
                    if (quantity === 0) return null;

                    const unitProfit = p.price - p.costPrice;
                    const totalProfit = unitProfit * quantity;
                    return {
                        productId: p.id,
                        productName: p.name,
                        quantity,
                        finalCostPrice: p.costPrice,
                        sellingPrice: p.price,
                        unitProfit,
                        totalProfit,
                    };
                })
                .filter((item): item is FeasibilityStudyItem => item !== null);
            
            const totalCost = studyItems.reduce((sum, item) => sum + (item.finalCostPrice * item.quantity), 0);
            const totalExpectedRevenue = studyItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
            const totalExpectedProfit = totalExpectedRevenue - totalCost;
            const averageMargin = totalExpectedRevenue > 0 ? (totalExpectedProfit / totalExpectedRevenue) * 100 : 0;
            const creationDate = new Date().toISOString().split('T')[0];

            newStudy = {
                id: `INV-${creationDate}`,
                sourceType: 'المخزون الحالي',
                sourceId: `المخزون بتاريخ ${creationDate}`,
                creationDate,
                items: studyItems,
                totalCost,
                totalExpectedRevenue,
                totalExpectedProfit,
                averageMargin,
            };

        } else { // Source is a Purchase Order
            const po = source;
            const totalItemsAmount = po.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const totalExpensesAmount = (po.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);

            const studyItems: FeasibilityStudyItem[] = po.items.map(item => {
                const itemValue = item.price * item.quantity;
                const allocatedExpense = totalItemsAmount > 0 ? (itemValue / totalItemsAmount) * totalExpensesAmount : 0;
                const finalCostPrice = item.quantity > 0 ? item.price + (allocatedExpense / item.quantity) : item.price;
                
                const product = products.find(p => p.id === item.productId);
                const sellingPrice = item.newSellingPrice || product?.price || 0;
                const unitProfit = sellingPrice - finalCostPrice;
                const totalProfit = unitProfit * item.quantity;

                return {
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    finalCostPrice,
                    sellingPrice,
                    unitProfit,
                    totalProfit,
                };
            });

            const totalCost = totalItemsAmount + totalExpensesAmount;
            const totalExpectedRevenue = studyItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
            const totalExpectedProfit = totalExpectedRevenue - totalCost;
            const averageMargin = totalExpectedRevenue > 0 ? (totalExpectedProfit / totalExpectedRevenue) * 100 : 0;

            newStudy = {
                id: `PO-${po.id}`,
                sourceType: 'أمر شراء',
                sourceId: po.poNumber,
                creationDate: new Date().toISOString().split('T')[0],
                items: studyItems,
                totalCost,
                totalExpectedRevenue,
                totalExpectedProfit,
                averageMargin,
            };
        }

        setFeasibilityStudies(prev => [...prev.filter(fs => fs.id !== newStudy.id), newStudy]);
        addNotification({ type: 'success', title: 'تم إنشاء دراسة الجدوى', message: `تم إنشاء دراسة جدوى جديدة بنجاح من ${newStudy.sourceType}.` });
        setActiveView('feasibility');
    };

    const handleStartShift = async (openingBalance: number) => {
        if (!currentUser) return;
        try {
            const newShift = await apiService.startShift({
                userId: currentUser.id,
                userName: currentUser.name,
                openingBalance,
            });
            setActiveShift(newShift);
            addNotification({ type: 'success', title: 'تم بدء الدوام', message: 'تم بدء فترة العمل بنجاح.' });
        } catch (error) {
            addNotification({ type: 'error', title: 'خطأ', message: (error as Error).message });
            throw error;
        }
    };

    const handleEndShift = async (shiftId: number, closingBalance: number): Promise<PosShift> => {
        try {
            const closedShift = await apiService.endShift(shiftId, { closingBalance });
            setActiveShift(null);
            addNotification({ type: 'success', title: 'تم إغلاق الدوام', message: 'تم إنهاء فترة العمل بنجاح.' });
            return closedShift;
        } catch (error) {
            addNotification({ type: 'error', title: 'خطأ', message: (error as Error).message });
            throw error;
        }
    };

  const hasPermission = (permission: Permission): boolean => {
    if (currentUser?.role === 'مدير النظام') return true;
    return rolePermissions[currentUser?.role as UserRole]?.includes(permission) || false;
  };
  
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard title="إجمالي المبيعات" value={45231.89} icon={<DollarSignIcon />} trend="+12% عن الشهر الماضي" trendColor="text-[var(--accent-green)]" currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} />
              <DashboardCard title="إجمالي المشتريات" value={32100.50} icon={<ShoppingCartIcon />} trend="-5% عن الشهر الماضي" trendColor="text-[var(--accent-red)]" currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} />
              <DashboardCard title="عدد العملاء" value={350} icon={<UsersIcon />} trend="+20 عميل جديد" trendColor="text-[var(--accent-green)]" />
              <DashboardCard title="المنتجات في المخزون" value={1280} icon={<ArchiveIcon />} trend="+50 منتج" trendColor="text-[var(--accent-green)]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg h-[400px]">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">نظرة عامة على المبيعات</h2>
                <SalesChart currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} />
              </div>
              <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
                <RecentActivities addNotification={addNotification} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
                   <TopSellingProducts salesOrders={salesOrders} products={products} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} />
                </div>
                <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg h-[350px]">
                    <SalesByCategoryChart salesOrders={salesOrders} products={products} categories={productCategories} />
                </div>
                <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg h-[350px]">
                    <InventoryDistributionChart products={products} warehouses={warehouses} />
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
                    <TeamMembers users={users} />
                </div>
                <div className="lg:col-span-1">
                    <AiAssistant />
                </div>
            </div>
          </>
        );
      case 'products':
        return <ProductManagement products={products} suppliers={suppliers} warehouses={warehouses} categories={productCategories} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} addNotification={addNotification} hasPermission={hasPermission} onPrintBarcodes={handlePrintBarcodes} />;
      case 'suppliers':
        return <SupplierManagement suppliers={suppliers} products={products} onSave={handleSaveSupplier} onDelete={handleDeleteSupplier} addNotification={addNotification} currencies={[{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}]} hasPermission={hasPermission} />;
      case 'purchases':
        return <PurchaseManagement purchaseOrders={purchaseOrders} products={products} suppliers={suppliers} warehouses={warehouses} categories={productCategories} accounts={accounts} onSavePurchaseOrder={handleSavePurchaseOrder} onUpdateStatus={handleUpdatePOStatus} onSaveProduct={handleSaveProduct} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} addNotification={addNotification} hasPermission={hasPermission} onCreateFeasibilityStudy={handleCreateFeasibilityStudy} />;
      case 'sales':
        return <SalesManagement salesOrders={salesOrders} products={products} customers={customers} warehouses={warehouses} categories={productCategories} onSaveSalesOrder={handleSaveSalesOrder} onUpdateStatus={handleUpdateSOStatus} onSaveCustomer={handleSaveCustomer} onSaveProduct={handleSaveProduct} suppliers={suppliers} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} addNotification={addNotification} hasPermission={hasPermission} systemSettings={systemSettings!} />;
      case 'customers':
        return <CustomerManagement customers={customers} onSave={handleSaveCustomer} onDelete={handleDeleteCustomer} hasPermission={hasPermission} />;
      case 'admin':
        return <SystemAdmin users={users} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onAddUser={handleAddUser} hasPermission={hasPermission} />;
      case 'settings':
        return <SystemSettings settings={systemSettings!} onSave={handleUpdateSystemSettings} hasPermission={hasPermission} />;
      case 'inventory':
        return <InventoryManagement products={products} inventoryLogs={inventoryLogs} salesOrders={salesOrders} warehouses={warehouses} inventoryTransfers={inventoryTransfers} onSaveInventoryTransfer={handleSaveInventoryTransfer} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} hasPermission={hasPermission} inventoryCounts={inventoryCounts} onPostInventoryCount={handlePostInventoryCount} onCreateFeasibilityStudy={handleCreateFeasibilityStudy} />;
      case 'warehouses':
        return <WarehouseManagement warehouses={warehouses} onSave={handleSaveWarehouse} onDelete={handleDeleteWarehouse} hasPermission={hasPermission} />;
      case 'categories':
        return <CategoryManagement categories={productCategories} onSave={handleSaveCategory} onDelete={handleDeleteCategory} hasPermission={hasPermission} />;
      case 'hr':
        return <HRManagement rolePermissions={rolePermissions} onUpdate={handleUpdateRolePermissions} hasPermission={hasPermission} />;
      case 'reports':
        return <ReportsManagement hasPermission={hasPermission} salesOrders={salesOrders} purchaseOrders={purchaseOrders} products={products} customers={customers} suppliers={suppliers} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} financialPeriods={financialPeriods} categories={productCategories} onNavigate={setActiveView} />;
      case 'accounting':
        return <AccountingManagement accounts={accounts} journalEntries={journalEntries} onSaveAccount={handleSaveAccount} onCreateJournalEntry={createJournalEntry} hasPermission={hasPermission} financialPeriods={financialPeriods} onClosePeriod={handleClosePeriod} />;
      case 'pos':
        return <PointOfSale products={products} customers={customers} warehouses={warehouses} onSaveSalesOrder={handleSaveSalesOrder} onUpdateStatus={handleUpdateSOStatus} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} addNotification={addNotification} currentUser={currentUser} systemSettings={systemSettings!} activeShift={activeShift} onStartShift={handleStartShift} onEndShift={handleEndShift} hasPermission={hasPermission} />;
      case 'feasibility':
        return <FeasibilityStudyManagement studies={feasibilityStudies} hasPermission={hasPermission} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} />;
      case 'about':
        return <About />;
      case 'profile':
        return <UserProfile user={currentUser!} onSave={handleUpdateUserProfile} onChangePassword={handleChangePassword} />;
      default:
        return <div>View not found</div>;
    }
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} systemSettings={systemSettings || {} as SystemSettingsType} />;
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900"><p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p></div>;
  }

  if (barcodePrintJob) {
    return <BarcodePrintSheet product={barcodePrintJob.product} quantity={barcodePrintJob.quantity} currency={{code: 'LYD', name: 'Dinar', symbol: 'LD', rate: 1}} />;
  }

  if (!systemSettings) {
      return (
          <div className="flex flex-col justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 p-4 text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">فشل الاتصال بالخادم</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  تعذر تحميل بيانات النظام. الرجاء التأكد من أن الخادم المحلي يعمل بشكل صحيح ثم قم بتحديث الصفحة.
              </p>
              <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                  تسجيل الخروج
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        onLogout={handleLogout}
        activeView={activeView}
        onNavigate={setActiveView}
        currentUser={currentUser}
        hasPermission={hasPermission}
        systemSettings={systemSettings}
        user={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {renderContent()}
      </main>
       <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
          <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
              {notifications.map(n => (
                  <NotificationToast 
                    key={n.id} 
                    notification={n} 
                    onClose={removeNotification}
                  />
              ))}
          </div>
      </div>
      {isNewUser && currentUser && (
        <WelcomeModal 
          user={currentUser} 
          onClose={() => setIsNewUser(false)} 
        />
      )}
    </div>
  );
};

export default App;