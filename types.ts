export interface Activity {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

export interface SalesData {
  month: string;
  sales: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate against the base currency
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  category?: string; // e.g., 'Sales Report', 'Inventory Check'
}

export type UserRole = 'مدير النظام' | 'مدير مبيعات' | 'مسؤول مشتريات' | 'أخصائي موارد بشرية' | 'مدير مخزون' | 'موظف';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatar: string;
  status: 'Active' | 'Inactive';
}

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'error';
  message: string;
  title?: string;
  link?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  isPerishable: boolean; // Does it require an expiry date?
}

export interface Product {
  id: number;
  code: string;
  name: string;
  barcode: string;
  description: string;
  costPrice: number;
  profitMargin: number;
  price: number; // SELLING price per piece
  packagePrice: number; // COST price per package
  packagingType: 'كرتون' | 'صندوق' | 'علبة';
  itemsPerPackage: number;
  stockLocations: { warehouseId: number; quantity: number; }[];
  categoryId: number;
  expiryDate: string;
  supplier: string;
  reorderPoint?: number;
  isFeatured?: boolean;
}

export interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  iban: string;
}

export interface Supplier {
  id: number;
  name: string;
  type: 'محلي' | 'أجنبي';
  currencyCode: 'LYD' | 'USD' | 'EUR' | 'GBP';
  contactPerson: string;
  email: string;
  phone: string;
  bankAccounts: BankAccount[];
}

export interface PurchaseOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number; // Price per piece at time of purchase (COST)
  expiryDate?: string;
  newSellingPrice?: number;
  finalCostPrice?: number;
}

export interface PurchaseOrderExpense {
    description: string;
    amount: number;
}

export interface PurchaseOrder {
    id: number;
    poNumber: string;
    supplierId: number;
    supplierName: string;
    orderDate: string;
    status: 'مسودة' | 'تم الطلب' | 'تم الاستلام' | 'ملغي';
    items: PurchaseOrderItem[];
    expenses?: PurchaseOrderExpense[];
    totalAmount: number;
    destinationWarehouseId: number;
}

export interface SalesOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number; // Price per piece at time of sale
}

export type CustomerType = 'عادي' | 'مميز' | 'جهة اعتبارية';

export interface Customer {
  id: number;
  name: string;
  type: CustomerType;
  email: string;
  phone: string;
  region: string;
}

export interface SystemSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo: string;
  vatRate: number; // Stored as a percentage, e.g., 15 for 15%
  defaultCurrency: 'LYD' | 'USD' | 'EUR' | 'GBP';
  posReceiptFooter: string;
  primaryColor?: string;
  fontSize?: 'sm' | 'base' | 'lg';
  showCompanyNameInHeader?: boolean;
  animateCompanyName?: boolean;
}

export type PaymentMethod = 'نقدي' | 'بطاقة' | 'رابط دفع';

export interface SalesOrder {
    id: number;
    soNumber: string;
    customerId: number;
    customerName: string;
    orderDate: string;
    status: 'قيد التجهيز' | 'تم الشحن' | 'مكتمل' | 'ملغي';
    items: SalesOrderItem[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number; // This will now be subtotal + taxAmount
    sourceWarehouseId: number;
    paymentMethod?: PaymentMethod;
    paymentLink?: string;
    type?: 'Sale' | 'Return';
    shiftId?: number;
}

export interface InventoryLog {
  id: number;
  productId: number;
  productName: string;
  type: 'شراء' | 'بيع' | 'تعديل يدوي' | 'تحويل داخلي' | 'تحويل خارجي' | 'تسوية جرد';
  quantityChange: number;
  newStock: number; // Stock in the specific warehouse
  date: string;
  reference?: string; // PO, SO, Transfer ID, or user name
  warehouseId: number;
}

export type WarehouseType = 'رئيسي' | 'فرعي' | 'بضاعة في الطريق' | 'مهمة خاصة';

export interface Warehouse {
    id: number;
    name: string;
    type: WarehouseType;
}

export interface InventoryTransferItem {
    productId: number;
    productName: string;
    quantity: number;
}

export interface InventoryTransfer {
    id: number;
    reference: string;
    fromWarehouseId: number;
    toWarehouseId: number;
    items: InventoryTransferItem[];
    date: string;
}

// Inventory Count Types
export interface InventoryCountItem {
  productId: number;
  productName: string;
  systemQty: number;
  countedQty: number | null; // Null when not yet counted
  variance: number;
}

export interface InventoryCount {
  id: number;
  warehouseId: number;
  date: string;
  status: 'مسودة' | 'معتمد';
  items: InventoryCountItem[];
}

// POS Shift
export interface PosShift {
    id: number;
    userId: number;
    userName: string;
    startTime: string;
    endTime: string | null;
    status: 'Open' | 'Closed';
    openingBalance: number;
    closingBalance: number | null;
    calculatedCash: number | null;
    cashSales: number | null;
    cardSales: number | null;
    cashReturns: number | null;
    difference: number | null;
}

// Financial Period Types
export interface FinancialPeriodSnapshot {
  totalSales: number;
  totalPurchases: number;
  inventoryValue: number;
  cogs: number;
  grossProfit: number;
}
export interface FinancialPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'مفتوحة' | 'مغلقة';
  snapshotData?: FinancialPeriodSnapshot;
}

// Accounting Types
export type AccountType = 'الأصول' | 'الخصوم' | 'حقوق الملكية' | 'الإيرادات' | 'المصروفات';
export const AccountTypes: AccountType[] = ['الأصول', 'الخصوم', 'حقوق الملكية', 'الإيرادات', 'المصروفات'];

export interface Account {
  id: number;
  number: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface JournalEntryItem {
  accountId: number;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: number;
  date: string;
  description: string;
  reference?: string; // e.g., SO-2024-001, PO-2024-002
  items: JournalEntryItem[];
}

// Feasibility Study Types
export interface FeasibilityStudyItem {
  productId: number;
  productName: string;
  quantity: number;
  finalCostPrice: number; // Cost after distributing expenses
  sellingPrice: number;
  unitProfit: number;
  totalProfit: number;
}

export interface FeasibilityStudy {
  id: string; // e.g., 'PO-1' or 'INV-2024-07-26'
  sourceType: 'أمر شراء' | 'المخزون الحالي';
  sourceId: string;
  creationDate: string;
  items: FeasibilityStudyItem[];
  totalCost: number; // Capital
  totalExpectedRevenue: number;
  totalExpectedProfit: number;
  averageMargin: number; // In percentage
}


export type Permission =
  // Products
  | 'VIEW_PRODUCTS'
  | 'MANAGE_PRODUCTS' // Add/Edit
  | 'DELETE_PRODUCTS'
  // Categories
  | 'VIEW_CATEGORIES'
  | 'MANAGE_CATEGORIES'
  // Suppliers
  | 'VIEW_SUPPLIERS'
  | 'MANAGE_SUPPLIERS'
  | 'DELETE_SUPPLIERS'
  // Customers
  | 'VIEW_CUSTOMERS'
  | 'MANAGE_CUSTOMERS'
  | 'DELETE_CUSTOMERS'
  // Sales
  | 'VIEW_SALES'
  | 'CREATE_SALES_ORDERS'
  | 'MANAGE_SALES_ORDERS' // Edit/Update Status
  | 'ACCESS_POS'
  | 'MANAGE_POS_SHIFTS' // Start/End POS shifts
  // Purchases
  | 'VIEW_PURCHASES'
  | 'CREATE_PURCHASE_ORDERS'
  | 'MANAGE_PURCHASE_ORDERS' // Edit/Update Status
  // Inventory
  | 'VIEW_INVENTORY'
  | 'MANAGE_INVENTORY_TRANSFERS'
  | 'MANAGE_INVENTORY_COUNTS'
  // Warehouses
  | 'VIEW_WAREHOUSES'
  | 'MANAGE_WAREHOUSES'
  // HR & Permissions
  | 'VIEW_HR'
  | 'MANAGE_PERMISSIONS'
  // System Admin
  | 'VIEW_ADMIN'
  | 'MANAGE_USERS' // Add/Edit/Delete Users
  | 'MANAGE_SYSTEM_SETTINGS'
  // Reports
  | 'VIEW_REPORTS'
  | 'VIEW_SALES_REPORTS'
  | 'VIEW_PURCHASE_REPORTS'
  | 'VIEW_INVENTORY_REPORTS'
  // Feasibility Studies
  | 'VIEW_FEASIBILITY_STUDIES'
  | 'CREATE_FEASIBILITY_STUDIES'
  // Accounting
  | 'VIEW_ACCOUNTING'
  | 'MANAGE_CHART_OF_ACCOUNTS'
  | 'CREATE_JOURNAL_ENTRIES'
  | 'CLOSE_FINANCIAL_PERIODS';


export type RolePermissions = Record<UserRole, Permission[]>;


export type View = 'dashboard' | 'products' | 'suppliers' | 'purchases' | 'sales' | 'customers' | 'admin' | 'inventory' | 'warehouses' | 'categories' | 'hr' | 'reports' | 'accounting' | 'pos' | 'settings' | 'about' | 'profile' | 'feasibility';