const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const { initialUsers, initialCategories, initialProducts, initialSuppliers, initialPurchaseOrders, initialCustomers, initialSalesOrders, initialWarehouses, initialSystemSettings, initialChartOfAccounts, initialRolePermissions, initialFinancialPeriods, initialPosShifts } = require('./initialData');

async function initializeDatabase() {
    const db = await open({
        filename: path.join(__dirname, '..', 'database.db'),
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON;');
    
    const usersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (usersTable) {
        // Migrations for existing databases
        const userColumns = await db.all("PRAGMA table_info(users)");
        if (!userColumns.some(col => col.name === 'password')) {
            console.log("Migrating users table, adding password column...");
            await db.exec('ALTER TABLE users ADD COLUMN password TEXT');
            for (const user of initialUsers) {
                 await db.run('UPDATE users SET password = ? WHERE id = ?', user.password, user.id);
            }
        }

        if (!userColumns.some(col => col.name === 'phone')) {
            console.log("Migrating users table, adding phone column...");
            await db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
            for (const user of initialUsers) {
                 await db.run('UPDATE users SET phone = ? WHERE id = ?', user.phone, user.id);
            }
        }
        
        const salesColumns = await db.all("PRAGMA table_info(sales_orders)");
        if (!salesColumns.some(col => col.name === 'paymentMethod')) {
             console.log("Migrating sales_orders table, adding payment columns...");
             await db.exec('ALTER TABLE sales_orders ADD COLUMN paymentMethod TEXT');
             await db.exec('ALTER TABLE sales_orders ADD COLUMN paymentLink TEXT');
        }
        if (!salesColumns.some(col => col.name === 'type')) {
            console.log("Migrating sales_orders table, adding type and shiftId columns...");
            await db.exec('ALTER TABLE sales_orders ADD COLUMN type TEXT DEFAULT "Sale"');
            await db.exec('ALTER TABLE sales_orders ADD COLUMN shiftId INTEGER');
        }


        const customerColumns = await db.all("PRAGMA table_info(customers)");
        if (!customerColumns.some(col => col.name === 'region')) {
             console.log("Migrating customers table, adding region column...");
             await db.exec('ALTER TABLE customers ADD COLUMN region TEXT');
             // Seed existing customers with a default region
             await db.run("UPDATE customers SET region = 'غير محدد' WHERE region IS NULL");
        }


        console.log('Database already initialized.');
        return db;
    }

    console.log('Database not found. Seeding new database...');

    // Create tables
    await db.exec(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            avatar TEXT,
            status TEXT NOT NULL,
            password TEXT NOT NULL
        );
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL, name TEXT NOT NULL, barcode TEXT, description TEXT,
            costPrice REAL, profitMargin REAL, price REAL, packagePrice REAL, packagingType TEXT,
            itemsPerPackage INTEGER, stockLocations TEXT, categoryId INTEGER, expiryDate TEXT,
            supplier TEXT, reorderPoint INTEGER, isFeatured INTEGER
        );
        CREATE TABLE suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, type TEXT, currencyCode TEXT, contactPerson TEXT,
            email TEXT, phone TEXT, bankAccounts TEXT
        );
        CREATE TABLE customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, type TEXT, email TEXT, phone TEXT,
            region TEXT
        );
        CREATE TABLE purchase_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poNumber TEXT NOT NULL, supplierId INTEGER, supplierName TEXT, orderDate TEXT,
            status TEXT, items TEXT, expenses TEXT, totalAmount REAL, destinationWarehouseId INTEGER
        );
        CREATE TABLE sales_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            soNumber TEXT NOT NULL, customerId INTEGER, customerName TEXT, orderDate TEXT,
            status TEXT, items TEXT, subtotal REAL, taxAmount REAL, totalAmount REAL, sourceWarehouseId INTEGER,
            paymentMethod TEXT,
            paymentLink TEXT,
            type TEXT DEFAULT 'Sale',
            shiftId INTEGER
        );
        CREATE TABLE pos_shifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            userName TEXT NOT NULL,
            startTime TEXT NOT NULL,
            endTime TEXT,
            status TEXT NOT NULL,
            openingBalance REAL NOT NULL,
            closingBalance REAL,
            calculatedCash REAL,
            cashSales REAL,
            cardSales REAL,
            cashReturns REAL,
            difference REAL,
            FOREIGN KEY (userId) REFERENCES users(id)
        );
        CREATE TABLE app_data (
             key TEXT PRIMARY KEY,
             value TEXT
        );
    `);

    // Seed data
    const userInsert = await db.prepare('INSERT INTO users (id, name, role, email, avatar, status, password, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const user of initialUsers) {
        await userInsert.run(user.id, user.name, user.role, user.email, user.avatar, user.status, user.password, user.phone);
    }
    await userInsert.finalize();

    const productInsert = await db.prepare('INSERT INTO products (id, code, name, description, costPrice, profitMargin, price, packagePrice, packagingType, itemsPerPackage, stockLocations, categoryId, expiryDate, supplier, reorderPoint, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const p of initialProducts) {
        await productInsert.run(p.id, p.code, p.name, p.description, p.costPrice, p.profitMargin, p.price, p.packagePrice, p.packagingType, p.itemsPerPackage, JSON.stringify(p.stockLocations), p.categoryId, p.expiryDate, p.supplier, p.reorderPoint, p.isFeatured ? 1 : 0);
    }
    await productInsert.finalize();
    
    const supplierInsert = await db.prepare('INSERT INTO suppliers (id, name, type, currencyCode, contactPerson, email, phone, bankAccounts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const s of initialSuppliers) {
        await supplierInsert.run(s.id, s.name, s.type, s.currencyCode, s.contactPerson, s.email, s.phone, JSON.stringify(s.bankAccounts));
    }
    await supplierInsert.finalize();
    
    const customerInsert = await db.prepare('INSERT INTO customers (id, name, type, email, phone, region) VALUES (?, ?, ?, ?, ?, ?)');
    for (const c of initialCustomers) {
        await customerInsert.run(c.id, c.name, c.type, c.email, c.phone, c.region);
    }
    await customerInsert.finalize();

    const poInsert = await db.prepare('INSERT INTO purchase_orders (id, poNumber, supplierId, supplierName, orderDate, status, items, expenses, totalAmount, destinationWarehouseId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const po of initialPurchaseOrders) {
        await poInsert.run(po.id, po.poNumber, po.supplierId, po.supplierName, po.orderDate, po.status, JSON.stringify(po.items), JSON.stringify(po.expenses), po.totalAmount, po.destinationWarehouseId);
    }
    await poInsert.finalize();

    const soInsert = await db.prepare('INSERT INTO sales_orders (id, soNumber, customerId, customerName, orderDate, status, items, subtotal, taxAmount, totalAmount, sourceWarehouseId, paymentMethod, paymentLink, type, shiftId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const so of initialSalesOrders) {
        await soInsert.run(so.id, so.soNumber, so.customerId, so.customerName, so.orderDate, so.status, JSON.stringify(so.items), so.subtotal, so.taxAmount, so.totalAmount, so.sourceWarehouseId, so.paymentMethod, so.paymentLink, so.type || 'Sale', so.shiftId);
    }
    await soInsert.finalize();
    
    const appDataInsert = await db.prepare('INSERT INTO app_data (key, value) VALUES (?, ?)');
    await appDataInsert.run('warehouses', JSON.stringify(initialWarehouses));
    await appDataInsert.run('productCategories', JSON.stringify(initialCategories));
    await appDataInsert.run('systemSettings', JSON.stringify(initialSystemSettings));
    await appDataInsert.run('accounts', JSON.stringify(initialChartOfAccounts));
    await appDataInsert.run('rolePermissions', JSON.stringify(initialRolePermissions));
    await appDataInsert.run('financialPeriods', JSON.stringify(initialFinancialPeriods));
    await appDataInsert.run('posShifts', JSON.stringify(initialPosShifts));
    await appDataInsert.finalize();
    
    console.log('Database seeded successfully.');
    return db;
}

module.exports = { initializeDatabase };