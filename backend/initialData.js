const initialUsers = [
  { id: 1, name: 'علي الأحمد', role: 'مدير النظام', email: 'ali.ahmed@example.ly', phone: '0912345678', avatar: 'https://i.pravatar.cc/150?u=1', status: 'Active', password: 'password123' },
  { id: 2, name: 'فاطمة الزهراء', role: 'مدير مبيعات', email: 'fatima.z@example.ly', phone: '0923456789', avatar: 'https://i.pravatar.cc/150?u=2', status: 'Active', password: 'password123' },
  { id: 3, name: 'محمد عبدالله', role: 'مسؤول مشتريات', email: 'mohammed.a@example.ly', phone: '0919876543', avatar: 'https://i.pravatar.cc/150?u=3', status: 'Active', password: 'password123' },
  { id: 4, name: 'أحمد خالد', role: 'أخصائي موارد بشرية', email: 'ahmed.k@example.ly', phone: '0945678901', avatar: 'https://i.pravatar.cc/150?u=4', status: 'Inactive', password: 'password123' },
  { id: 5, name: 'نورة سعد', role: 'مدير مخزون', email: 'noura.s@example.ly', phone: '0911122334', avatar: 'https://i.pravatar.cc/150?u=5', status: 'Active', password: 'password123' },
];

const initialCategories = [
  { id: 1, name: 'زيوت وسمن', isPerishable: false },
  { id: 2, name: 'معلبات', isPerishable: true },
  { id: 3, name: 'مشروبات', isPerishable: true },
  { id: 4, name: 'حبوب ومكرونة', isPerishable: false },
  { id: 5, name: 'ألبان وأجبان', isPerishable: true },
  { id: 6, name: 'حلويات وبسكويت', isPerishable: true },
  { id: 7, name: 'منظفات', isPerishable: false },
  { id: 8, name: 'عناية شخصية', isPerishable: false },
];

const initialSuppliers = [
    { id: 1, name: 'شركة النسيم للصناعات الغذائية', type: 'محلي', currencyCode: 'LYD', contactPerson: 'سالم المقرحي', email: 'sales@alnasim.ly', phone: '+218-91-212-0000', bankAccounts: [{ id: 1, bankName: 'مصرف الجمهورية', accountNumber: '2020304050', iban: 'LY882020304050' }] },
    { id: 2, name: 'مطاحن الدقيق الوطنية - طرابلس', type: 'محلي', currencyCode: 'LYD', contactPerson: 'علي الفيتوري', email: 'info@nfm.ly', phone: '+218-21-480-1111', bankAccounts: [{ id: 2, bankName: 'مصرف شمال افريقيا', accountNumber: '5566778899', iban: 'LY995566778899' }] },
    { id: 3, name: 'شركة ليبيا للمشروبات (بيبسي)', type: 'محلي', currencyCode: 'LYD', contactPerson: 'عمر بن علي', email: 'orders@pepsi.ly', phone: '+218-21-717-2222', bankAccounts: []},
    { id: 4, name: 'شركة نستله العالمية (وكيل ليبيا)', type: 'أجنبي', currencyCode: 'USD', contactPerson: 'Frederic Dubois', email: 'imports@nestle.ly', phone: '+218-92-333-4444', bankAccounts: [{ id: 3, bankName: 'Bank of Valletta (Libya Branch)', accountNumber: '400123987', iban: 'MT21VALL22197' }] },
    { id: 5, name: 'مجموعة العليان التجارية (وكيل)', type: 'أجنبي', currencyCode: 'USD', contactPerson: 'خالد السعودي', email: 'supply@olayan.ly', phone: '+218-91-555-6666', bankAccounts: []},
];

const productData = [
  // زيوت وسمن (Cat 1)
  { name: "زيت زيتون الريف 1ل", cost: 28, margin: 7, pkg: "كرتون", items: 12, sup: 1 },
  { name: "زيت عافية ذرة 1.8ل", cost: 14.5, margin: 10, pkg: "كرتون", items: 6, sup: 5 },
  { name: "سمن نباتي الأصيل 1كغ", cost: 12, margin: 12, pkg: "كرتون", items: 12, sup: 5 },
  { name: "زيت صولو 1ل", cost: 8.5, margin: 9, pkg: "كرتون", items: 12, sup: 1 },
  { name: "زبدة لورباك 200غ", cost: 11, margin: 15, pkg: "كرتون", items: 40, sup: 4 },
  
  // معلبات (Cat 2)
  { name: "معجون طماطم الهناء 400غ", cost: 3.25, margin: 15, pkg: "كرتون", items: 24, sup: 1 },
  { name: "تونة ريو ماري 160غ", cost: 8, margin: 12, pkg: "كرتون", items: 48, sup: 4 },
  { name: "فاصوليا معلبة حدائق كاليفورنيا", cost: 2.75, margin: 18, pkg: "كرتون", items: 24, sup: 5 },
  { name: "حمص حب العلالي", cost: 2.5, margin: 20, pkg: "كرتون", items: 24, sup: 5 },
  { name: "ذرة حلوة قودي", cost: 3, margin: 15, pkg: "كرتون", items: 24, sup: 5 },
  { name: "هريسة حارة دياري", cost: 2.25, margin: 22, pkg: "كرتون", items: 12, sup: 1 },
  { name: "مربى فراولة حلواني", cost: 5, margin: 14, pkg: "كرتون", items: 12, sup: 5 },
  { name: "زيتون أخضر كوبوليفا", cost: 6.5, margin: 11, pkg: "كرتون", items: 12, sup: 4 },

  // مشروبات (Cat 3)
  { name: "بيبسي 1.5ل", cost: 3.5, margin: 14, pkg: "صندوق", items: 6, sup: 3 },
  { name: "مياه النبع 1.5ل", cost: 0.75, margin: 25, pkg: "صندوق", items: 6, sup: 1 },
  { name: "عصير سن توب برتقال 250مل", cost: 1, margin: 20, pkg: "كرتون", items: 24, sup: 5 },
  { name: "شاي ليبتون 100 كيس", cost: 13, margin: 15, pkg: "كرتون", items: 24, sup: 4 },
  { name: "قهوة نسكافيه ريد مج", cost: 18, margin: 11, pkg: "كرتون", items: 12, sup: 4 },
  { name: "حليب نيدو مجفف 900غ", cost: 35, margin: 8, pkg: "كرتون", items: 6, sup: 4 },
  { name: "مشروب الطاقة ريد بول", cost: 6, margin: 16, pkg: "كرتون", items: 24, sup: 4 },
  
  // حبوب ومكرونة (Cat 4)
  { name: "مكرونة ليبيانا سباغيتي 500غ", cost: 2.25, margin: 22, pkg: "كرتون", items: 20, sup: 2 },
  { name: "مكرونة ليبيانا قلم 500غ", cost: 2.25, margin: 22, pkg: "كرتون", items: 20, sup: 2 },
  { name: "دقيق الوطنية 1كغ", cost: 3, margin: 16, pkg: "كرتون", items: 10, sup: 2 },
  { name: "أرز بسمتي أبو كاس 5كغ", cost: 45, margin: 11, pkg: "كرتون", items: 4, sup: 5 },
  { name: "كسكسي ليبيانو 1كغ", cost: 4.5, margin: 18, pkg: "كرتون", items: 12, sup: 2 },
  { name: "شوفان كويكر", cost: 9, margin: 13, pkg: "كرتون", items: 12, sup: 5 },
  { name: "عدس أحمر 1كغ", cost: 7, margin: 15, pkg: "كرتون", items: 10, sup: 2 },

  // ألبان وأجبان (Cat 5)
  { name: "حليب النسيم كامل الدسم 1ل", cost: 4, margin: 12, pkg: "صندوق", items: 12, sup: 1 },
  { name: "زبادي النسيم طبيعي", cost: 1, margin: 25, pkg: "صندوق", items: 8, sup: 1 },
  { name: "جبنة كيري 12 قطعة", cost: 6.5, margin: 15, pkg: "كرتون", items: 24, sup: 4 },
  { name: "جبنة بوك شرائح", cost: 8, margin: 12, pkg: "كرتون", items: 24, sup: 4 },
  { name: "جبنة فيلادلفيا", cost: 15, margin: 10, pkg: "كرتون", items: 12, sup: 4 },
  { name: "لبنة المراعي", cost: 9, margin: 14, pkg: "كرتون", items: 12, sup: 5 },
  { name: "حليب مبخر بوني", cost: 2.5, margin: 20, pkg: "كرتون", items: 48, sup: 4 },

  // حلويات وبسكويت (Cat 6)
  { name: "بسكويت أولكر بالتمر", cost: 1, margin: 30, pkg: "كرتون", items: 12, sup: 5 },
  { name: "شوكولاتة كيت كات", cost: 1.5, margin: 25, pkg: "كرتون", items: 24, sup: 4 },
  { name: "بسكويت أوريو", cost: 2, margin: 20, pkg: "كرتون", items: 16, sup: 5 },
  { name: "نوتيلا 350غ", cost: 16, margin: 12, pkg: "كرتون", items: 15, sup: 4 },
  { name: "بطاطس ليز ملح", cost: 1.25, margin: 28, pkg: "كرتون", items: 14, sup: 3 },
  { name: "كيك سفن دايز", cost: 1.5, margin: 24, pkg: "كرتون", items: 12, sup: 5 },
  { name: "ويفر لواكر", cost: 2.5, margin: 18, pkg: "كرتون", items: 25, sup: 4 },

  // منظفات (Cat 7)
  { name: "صابون تايد 3كغ", cost: 25, margin: 10, pkg: "كرتون", items: 4, sup: 5 },
  { name: "سائل جلي فيري ليمون", cost: 9, margin: 13, pkg: "كرتون", items: 10, sup: 5 },
  { name: "مطهر ديتول 500مل", cost: 12, margin: 15, pkg: "كرتون", items: 12, sup: 5 },
  { name: "مبيض كلوركس", cost: 5, margin: 20, pkg: "كرتون", items: 12, sup: 5 },
  { name: "مناديل فاين", cost: 2.5, margin: 25, pkg: "كرتون", items: 10, sup: 5 },
  
  // عناية شخصية (Cat 8)
  { name: "شامبو هيد اند شولدرز", cost: 14, margin: 14, pkg: "كرتون", items: 12, sup: 5 },
  { name: "صابون لوكس", cost: 2, margin: 25, pkg: "كرتون", items: 72, sup: 5 },
  { name: "معجون أسنان سيجنال", cost: 3.5, margin: 18, pkg: "كرتون", items: 24, sup: 5 },
];

const categoriesMap = {
  'زيوت وسمن': 1, 'معلبات': 2, 'مشروبات': 3, 'حبوب ومكرونة': 4,
  'ألبان وأجبان': 5, 'حلويات وبسكويت': 6, 'منظفات': 7, 'عناية شخصية': 8
};

const getCategoryIdByName = (name) => {
    for (const [catName, catId] of Object.entries(categoriesMap)) {
        if (name.includes('زيت') || name.includes('سمن') || name.includes('زبدة')) return 1;
        if (name.includes('معجون') || name.includes('تونة') || name.includes('فاصوليا') || name.includes('حمص') || name.includes('ذرة') || name.includes('هريسة') || name.includes('مربى') || name.includes('زيتون')) return 2;
        if (name.includes('بيبسي') || name.includes('مياه') || name.includes('عصير') || name.includes('شاي') || name.includes('قهوة') || name.includes('نيدو') || name.includes('ريد بول')) return 3;
        if (name.includes('مكرونة') || name.includes('دقيق') || name.includes('أرز') || name.includes('كسكسي') || name.includes('شوفان') || name.includes('عدس')) return 4;
        if (name.includes('حليب') || name.includes('زبادي') || name.includes('جبنة') || name.includes('لبنة')) return 5;
        if (name.includes('بسكويت') || name.includes('شوكولاتة') || name.includes('نوتيلا') || name.includes('بطاطس') || name.includes('كيك') || name.includes('ويفر')) return 6;
        if (name.includes('تايد') || name.includes('فيري') || name.includes('ديتول') || name.includes('كلوركس') || name.includes('مناديل')) return 7;
        if (name.includes('شامبو') || name.includes('صابون') || name.includes('معجون')) return 8;
    }
    return 1;
};

const initialProducts = productData.map((p, index) => {
  const categoryId = getCategoryIdByName(p.name);
  const isPerishable = initialCategories.find(c => c.id === categoryId)?.isPerishable || false;
  const expiryDate = isPerishable ? `2025-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '';
  const supplier = initialSuppliers.find(s => s.id === p.sup);
  return {
    id: index + 1,
    code: `FD-${String(categoryId).padStart(2, '0')}${String(index + 1).padStart(4, '0')}`,
    barcode: `621${String(Math.floor(100000000000 + Math.random() * 900000000000))}`.slice(0,13),
    name: p.name,
    description: `عبوة ${p.pkg} تحتوي على ${p.items} قطعة من ${p.name}`,
    costPrice: p.cost,
    profitMargin: p.margin,
    price: parseFloat((p.cost * (1 + p.margin / 100)).toFixed(2)),
    packagePrice: p.cost * p.items,
    packagingType: p.pkg,
    itemsPerPackage: p.items,
    stockLocations: [
      { warehouseId: 1, quantity: Math.floor(Math.random() * 200) + 50 },
      { warehouseId: 2, quantity: Math.floor(Math.random() * 100) },
    ],
    categoryId,
    expiryDate,
    supplier: supplier.name,
    reorderPoint: Math.floor(Math.random() * 20) + 10,
    isFeatured: Math.random() > 0.7,
  };
});


const initialPurchaseOrders = [
    { id: 1, poNumber: 'PO-2024-001', supplierId: 1, supplierName: 'شركة النسيم للصناعات الغذائية', orderDate: '2024-05-01', status: 'تم الاستلام', items: [{ productId: 1, productName: 'زيت زيتون الريف 1ل', quantity: 10, price: 28 }, { productId: 4, productName: 'زيت صولو 1ل', quantity: 15, price: 8.5 }], expenses: [{description: 'شحن', amount: 50}], totalAmount: 407.5, destinationWarehouseId: 1 },
    { id: 2, poNumber: 'PO-2024-002', supplierId: 4, supplierName: 'شركة نستله العالمية (وكيل ليبيا)', orderDate: '2024-05-15', status: 'تم الطلب', items: [{ productId: 5, productName: 'زبدة لورباك 200غ', quantity: 5, price: 11 }, { productId: 7, productName: 'تونة ريو ماري 160غ', quantity: 2, price: 8 }], totalAmount: 71, destinationWarehouseId: 1 },
];

const initialCustomers = [
    { id: 1, name: 'عميل نقدي', type: 'عادي', email: 'cash@pos.ly', phone: '000-0000000', region: 'غير محدد' },
    { id: 2, name: 'سوبر ماركت المدينة', type: 'جهة اعتبارية', email: 'purchases@almadina.ly', phone: '091-1112222', region: 'طرابلس' },
    { id: 3, name: 'محمد بن علي', type: 'مميز', email: 'm.ali@gmail.com', phone: '092-3334444', region: 'بنغازي' },
    { id: 4, name: 'بقالة النور', type: 'عادي', email: 'alnour@shop.ly', phone: '091-5556666', region: 'مصراتة' },
    { id: 5, name: 'شركة الواحة للخدمات النفطية', type: 'جهة اعتبارية', email: 'catering@waha-oil.com', phone: '021-9998888', region: 'طرابلس' },
    { id: 6, name: 'فاطمة خليفة', type: 'عادي', email: 'fatima.k@yahoo.com', phone: '094-1234567', region: 'سبها' },
];

const initialSalesOrders = [
    { id: 1, soNumber: 'SO-2024-001', customerId: 2, customerName: 'سوبر ماركت المدينة', orderDate: '2024-05-10', status: 'مكتمل', items: [{ productId: 1, productName: 'زيت زيتون الريف 1ل', quantity: 5, price: 30 }, { productId: 14, productName: 'بيبسي 1.5ل', quantity: 10, price: 4 }], subtotal: 190, taxAmount: 0, totalAmount: 190, sourceWarehouseId: 1, paymentMethod: 'نقدي', type: 'Sale' },
    { id: 2, soNumber: 'SO-2024-002', customerId: 3, customerName: 'محمد بن علي', orderDate: '2024-05-20', status: 'قيد التجهيز', items: [{ productId: 7, productName: 'تونة ريو ماري 160غ', quantity: 12, price: 9 }, { productId: 30, productName: 'جبنة كيري 12 قطعة', quantity: 3, price: 7.5 }], subtotal: 130.5, taxAmount: 0, totalAmount: 130.5, sourceWarehouseId: 1, paymentMethod: 'بطاقة', type: 'Sale' },
];

const initialWarehouses = [
    { id: 1, name: 'المخزن الرئيسي - طرابلس', type: 'رئيسي' },
    { id: 2, name: 'فرع بنغازي', type: 'فرعي' },
    { id: 3, name: 'بضاعة في الطريق', type: 'بضاعة في الطريق' },
];

const initialSystemSettings = {
    companyName: 'شركة النهضة للتجارة',
    companyAddress: 'طريق المطار، طرابلس، ليبيا',
    companyPhone: '+218 21 123 4567',
    companyEmail: 'info@alnahda-trade.ly',
    companyLogo: 'https://i.imgur.com/3Z9wL9c.png',
    vatRate: 0,
    defaultCurrency: 'LYD',
    posReceiptFooter: 'شكراً لتعاملكم معنا!',
    primaryColor: '#3b82f6',
    fontSize: 'base',
    showCompanyNameInHeader: true,
    animateCompanyName: false,
};

const initialChartOfAccounts = [
    { id: 1, number: '1010', name: 'الصندوق', type: 'الأصول', balance: 150000.75 },
    { id: 2, number: '1020', name: 'حساب المصرف', type: 'الأصول', balance: 850000.00 },
    { id: 3, number: '1110', name: 'المدينون (العملاء)', type: 'الأصول', balance: 75230.50 },
    { id: 4, number: '1210', name: 'المخزون', type: 'الأصول', balance: 450300.25 },
    { id: 5, number: '2010', name: 'الدائنون (الموردون)', type: 'الخصوم', balance: 95800.00 },
    { id: 6, number: '3010', name: 'رأس المال', type: 'حقوق الملكية', balance: 1000000.00 },
    { id: 7, number: '4010', name: 'إيرادات المبيعات', type: 'الإيرادات', balance: 375200.00 },
    { id: 8, number: '5010', name: 'تكلفة البضاعة المباعة', type: 'المصروفات', balance: 280100.00 },
    { id: 9, number: '5020', name: 'مصاريف إدارية وعمومية', type: 'المصروفات', balance: 45000.00 },
];

const initialFinancialPeriods = [
    { id: 1, name: 'الربع الأول 2024', startDate: '2024-01-01', endDate: '2024-03-31', status: 'مغلقة', snapshotData: { totalSales: 450000, totalPurchases: 320000, inventoryValue: 400000, cogs: 300000, grossProfit: 150000 } },
    { id: 2, name: 'الربع الثاني 2024', startDate: '2024-04-01', endDate: '2024-06-30', status: 'مفتوحة' },
];

const initialRolePermissions = {
  'مدير النظام': [], // Special case, has all permissions
  'مدير مبيعات': [
    'VIEW_PRODUCTS', 'VIEW_CATEGORIES', 'VIEW_SUPPLIERS', 'VIEW_CUSTOMERS', 
    'MANAGE_CUSTOMERS', 'VIEW_SALES', 'CREATE_SALES_ORDERS', 
    'MANAGE_SALES_ORDERS', 'ACCESS_POS', 'MANAGE_POS_SHIFTS', 'VIEW_INVENTORY', 'VIEW_WAREHOUSES', 
    'VIEW_REPORTS', 'VIEW_SALES_REPORTS', 'VIEW_INVENTORY_REPORTS',
    'VIEW_FEASIBILITY_STUDIES', 'CREATE_FEASIBILITY_STUDIES'
  ],
  'مسؤول مشتريات': [
    'VIEW_PRODUCTS', 'VIEW_SUPPLIERS', 'MANAGE_SUPPLIERS', 'VIEW_PURCHASES', 
    'CREATE_PURCHASE_ORDERS', 'MANAGE_PURCHASE_ORDERS', 'VIEW_INVENTORY', 
    'VIEW_WAREHOUSES', 'VIEW_REPORTS', 'VIEW_PURCHASE_REPORTS',
    'VIEW_FEASIBILITY_STUDIES', 'CREATE_FEASIBILITY_STUDIES'
  ],
  'مدير مخزون': [
    'VIEW_PRODUCTS', 'MANAGE_PRODUCTS', 'VIEW_CATEGORIES', 'MANAGE_CATEGORIES', 
    'VIEW_SUPPLIERS', 'VIEW_WAREHOUSES', 'MANAGE_WAREHOUSES', 'VIEW_INVENTORY', 
    'MANAGE_INVENTORY_TRANSFERS', 'MANAGE_INVENTORY_COUNTS', 'VIEW_PURCHASES',
    'VIEW_REPORTS', 'VIEW_INVENTORY_REPORTS',
    'VIEW_FEASIBILITY_STUDIES', 'CREATE_FEASIBILITY_STUDIES'
  ],
  'أخصائي موارد بشرية': [
    'VIEW_HR', 'MANAGE_PERMISSIONS', 'VIEW_ADMIN', 'MANAGE_USERS'
  ],
  'موظف': [
    'VIEW_PRODUCTS', 'VIEW_SALES', 'VIEW_CUSTOMERS'
  ]
};

const initialPosShifts = [];


module.exports = {
    initialUsers,
    initialCategories,
    initialProducts,
    initialSuppliers,
    initialPurchaseOrders,
    initialCustomers,
    initialSalesOrders,
    initialWarehouses,
    initialSystemSettings,
    initialChartOfAccounts,
    initialFinancialPeriods,
    initialRolePermissions,
    initialPosShifts,
};