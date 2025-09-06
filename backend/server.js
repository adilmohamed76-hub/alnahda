const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');
const path = require('path');

async function startServer() {
    const db = await initializeDatabase();
    const app = express();
    const PORT = 3001;

    app.use(cors());
    app.options('*', cors()); // Handle pre-flight requests
    app.use(express.json());

    // --- UTILITY TO PARSE/STRINGIFY JSON FIELDS ---
    const parseJsonFields = (records, fields) => {
        if (!records) return [];
        return records.map(rec => {
            if (!rec) return rec;
            const newRec = { ...rec };
            fields.forEach(field => {
                if (newRec[field] && typeof newRec[field] === 'string') {
                    try {
                        newRec[field] = JSON.parse(newRec[field]);
                    } catch (e) {
                        newRec[field] = [];
                    }
                }
            });
            return newRec;
        });
    };

    // --- MASTER DATA ENDPOINT ---
    app.get('/api/data', async (req, res) => {
        try {
            const users = await db.all('SELECT id, name, role, email, phone, avatar, status FROM users');
            let products = await db.all('SELECT * FROM products');
            let suppliers = await db.all('SELECT * FROM suppliers');
            const customers = await db.all('SELECT * FROM customers');
            let purchaseOrders = await db.all('SELECT * FROM purchase_orders');
            let salesOrders = await db.all('SELECT * FROM sales_orders');
            const appData = await db.all('SELECT * FROM app_data');

            // Parse JSON fields
            products = parseJsonFields(products, ['stockLocations']);
            suppliers = parseJsonFields(suppliers, ['bankAccounts']);
            purchaseOrders = parseJsonFields(purchaseOrders, ['items', 'expenses']);
            salesOrders = parseJsonFields(salesOrders, ['items']);
            
            const data = { users, products, suppliers, customers, purchaseOrders, salesOrders, inventoryLogs: [], inventoryTransfers: [], inventoryCounts: [], journalEntries: [] };
            
            appData.forEach(d => {
                try {
                    data[d.key] = JSON.parse(d.value);
                } catch(e) {
                    console.error(`Could not parse app_data key: ${d.key}`);
                }
            });

            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- AUTHENTICATION ---
    app.post('/api/login', async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await db.get('SELECT * FROM users WHERE name = ?', username);
            if (!user) {
                return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
            }
            // In a real app, you would use bcrypt.compare(password, user.password)
            if (password !== user.password) {
                 return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
            }

            const { password: _, ...userWithoutPassword } = user;
            res.json({ user: userWithoutPassword, token: 'dummy-auth-token' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/register', async (req, res) => {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'الرجاء إدخال جميع الحقول المطلوبة.' });
        }
    
        try {
            const existingUser = await db.get('SELECT id FROM users WHERE email = ? OR name = ?', email.toLowerCase(), name);
            if (existingUser) {
                return res.status(409).json({ error: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل.' });
            }
    
            const newUserAvatar = `https://i.pravatar.cc/150?u=${Date.now()}`;
            const defaultRole = 'موظف';
            const defaultStatus = 'Active';
    
            const sql = `INSERT INTO users (name, email, password, role, status, avatar, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const result = await db.run(sql, name, email.toLowerCase(), password, defaultRole, defaultStatus, newUserAvatar, phone);
    
            const newUser = await db.get('SELECT id, name, role, email, phone, avatar, status FROM users WHERE id = ?', result.lastID);
    
            res.status(201).json({ user: newUser, token: 'dummy-auth-token' });
    
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });


    // --- PRODUCTS CRUD ---
    app.get('/api/products', async (req, res) => {
        try {
            let products = await db.all('SELECT * FROM products');
            products = parseJsonFields(products, ['stockLocations']);
            res.json(products);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/products', async (req, res) => {
        const p = req.body;
        const sql = `INSERT INTO products (code, name, barcode, description, costPrice, profitMargin, price, packagePrice, packagingType, itemsPerPackage, stockLocations, categoryId, expiryDate, supplier, reorderPoint, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        try {
            const result = await db.run(sql, p.code, p.name, p.barcode, p.description, p.costPrice, p.profitMargin, p.price, p.packagePrice, p.packagingType, p.itemsPerPackage, JSON.stringify(p.stockLocations), p.categoryId, p.expiryDate, p.supplier, p.reorderPoint, p.isFeatured ? 1 : 0);
            res.status(201).json({ ...p, id: result.lastID });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.put('/api/products/:id', async (req, res) => {
        const p = req.body;
        const sql = `UPDATE products SET code = ?, name = ?, barcode = ?, description = ?, costPrice = ?, profitMargin = ?, price = ?, packagePrice = ?, packagingType = ?, itemsPerPackage = ?, stockLocations = ?, categoryId = ?, expiryDate = ?, supplier = ?, reorderPoint = ?, isFeatured = ? WHERE id = ?`;
        try {
            await db.run(sql, p.code, p.name, p.barcode, p.description, p.costPrice, p.profitMargin, p.price, p.packagePrice, p.packagingType, p.itemsPerPackage, JSON.stringify(p.stockLocations), p.categoryId, p.expiryDate, p.supplier, p.reorderPoint, p.isFeatured ? 1 : 0, req.params.id);
            res.json(req.body);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.delete('/api/products/:id', async (req, res) => {
        try {
            await db.run('DELETE FROM products WHERE id = ?', req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    
    // --- SUPPLIERS CRUD ---
    app.post('/api/suppliers', async (req, res) => {
        const s = req.body;
        const sql = `INSERT INTO suppliers (name, type, currencyCode, contactPerson, email, phone, bankAccounts) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        try {
            const result = await db.run(sql, s.name, s.type, s.currencyCode, s.contactPerson, s.email, s.phone, JSON.stringify(s.bankAccounts));
            res.status(201).json({ ...s, id: result.lastID });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.put('/api/suppliers/:id', async (req, res) => {
        const s = req.body;
        const sql = `UPDATE suppliers SET name = ?, type = ?, currencyCode = ?, contactPerson = ?, email = ?, phone = ?, bankAccounts = ? WHERE id = ?`;
        try {
            await db.run(sql, s.name, s.type, s.currencyCode, s.contactPerson, s.email, s.phone, JSON.stringify(s.bankAccounts), req.params.id);
            res.json(s);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.delete('/api/suppliers/:id', async (req, res) => {
        try {
            await db.run('DELETE FROM suppliers WHERE id = ?', req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- CUSTOMERS CRUD ---
    app.post('/api/customers', async (req, res) => {
        const c = req.body;
        const sql = `INSERT INTO customers (name, type, email, phone, region) VALUES (?, ?, ?, ?, ?)`;
        try {
            const result = await db.run(sql, c.name, c.type, c.email, c.phone, c.region);
            res.status(201).json({ ...c, id: result.lastID });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.put('/api/customers/:id', async (req, res) => {
        const c = req.body;
        const sql = `UPDATE customers SET name = ?, type = ?, email = ?, phone = ?, region = ? WHERE id = ?`;
        try {
            await db.run(sql, c.name, c.type, c.email, c.phone, c.region, req.params.id);
            res.json(c);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.delete('/api/customers/:id', async (req, res) => {
        try {
            await db.run('DELETE FROM customers WHERE id = ?', req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });


    // --- SALES ORDERS ---
    app.post('/api/sales', async (req, res) => {
        const so = req.body;
        const sql = `INSERT INTO sales_orders (soNumber, customerId, customerName, orderDate, status, items, subtotal, taxAmount, totalAmount, sourceWarehouseId, paymentMethod, paymentLink, type, shiftId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        try {
            const result = await db.run(sql, so.soNumber, so.customerId, so.customerName, so.orderDate, so.status, JSON.stringify(so.items), so.subtotal, so.taxAmount, so.totalAmount, so.sourceWarehouseId, so.paymentMethod, so.paymentLink, so.type || 'Sale', so.shiftId);
            const newOrder = await db.get('SELECT * FROM sales_orders WHERE id = ?', result.lastID);
            const parsedOrder = parseJsonFields([newOrder], ['items'])[0];
            res.status(201).json(parsedOrder);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.put('/api/sales/:id/status', async (req, res) => {
        const { status } = req.body;
        const { id } = req.params;
        try {
            const orderRes = await db.get('SELECT items, sourceWarehouseId, type, status as oldStatus FROM sales_orders WHERE id = ?', id);
            
            if (!orderRes) return res.status(404).json({ error: 'Order not found' });
            
            // Only update stock if status is changing to a completed state from a pending state
            if ((status === 'تم الشحن' || status === 'مكتمل') && orderRes.oldStatus !== 'تم الشحن' && orderRes.oldStatus !== 'مكتمل') {
                const order = parseJsonFields([orderRes], ['items'])[0];
                
                await db.run('BEGIN TRANSACTION');
                for (const item of order.items) {
                    const productRes = await db.get('SELECT stockLocations FROM products WHERE id = ?', item.productId);
                    if (productRes) {
                        const stockLocations = JSON.parse(productRes.stockLocations);
                        const locIndex = stockLocations.findIndex(sl => sl.warehouseId === order.sourceWarehouseId);
                        if (locIndex !== -1) {
                            if (order.type === 'Return') {
                                stockLocations[locIndex].quantity += item.quantity; // Add back to stock
                            } else {
                                stockLocations[locIndex].quantity -= item.quantity; // Deduct from stock
                            }
                            await db.run('UPDATE products SET stockLocations = ? WHERE id = ?', JSON.stringify(stockLocations), item.productId);
                        }
                    }
                }
                await db.run('COMMIT');
            }
            await db.run('UPDATE sales_orders SET status = ? WHERE id = ?', status, id);
            res.status(200).json({ id, status });
        } catch (err) {
            await db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
        }
    });
    
    // --- POS SHIFTS ---
    app.get('/api/pos/active-shift/:userId', async (req, res) => {
        try {
            const shift = await db.get('SELECT * FROM pos_shifts WHERE userId = ? AND status = ?', [req.params.userId, 'Open']);
            res.json(shift || null);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/pos/start-shift', async (req, res) => {
        const { userId, userName, openingBalance } = req.body;
        const startTime = new Date().toISOString();
        try {
            const existingShift = await db.get('SELECT * FROM pos_shifts WHERE userId = ? AND status = ?', [userId, 'Open']);
            if (existingShift) {
                return res.status(400).json({ error: 'لدى هذا المستخدم فترة عمل مفتوحة بالفعل.' });
            }
            const sql = 'INSERT INTO pos_shifts (userId, userName, startTime, status, openingBalance) VALUES (?, ?, ?, ?, ?)';
            const result = await db.run(sql, userId, userName, startTime, 'Open', openingBalance);
            const newShift = await db.get('SELECT * FROM pos_shifts WHERE id = ?', result.lastID);
            res.status(201).json(newShift);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/pos/end-shift/:id', async (req, res) => {
        const { closingBalance } = req.body;
        const endTime = new Date().toISOString();
        try {
            const shift = await db.get('SELECT * FROM pos_shifts WHERE id = ?', req.params.id);
            if (!shift || shift.status === 'Closed') {
                return res.status(400).json({ error: 'فترة العمل غير موجودة أو مغلقة بالفعل.' });
            }

            const orders = await db.all('SELECT * FROM sales_orders WHERE shiftId = ? AND (status = ? OR status = ?)', [shift.id, 'مكتمل', 'تم الشحن']);
            
            const cashSales = orders.filter(o => o.type !== 'Return' && o.paymentMethod === 'نقدي').reduce((sum, o) => sum + o.totalAmount, 0);
            const cardSales = orders.filter(o => o.type !== 'Return' && o.paymentMethod === 'بطاقة').reduce((sum, o) => sum + o.totalAmount, 0);
            const cashReturns = orders.filter(o => o.type === 'Return' && o.paymentMethod === 'نقدي').reduce((sum, o) => sum + o.totalAmount, 0);

            const calculatedCash = shift.openingBalance + cashSales - cashReturns;
            const difference = closingBalance - calculatedCash;

            const sql = `UPDATE pos_shifts SET endTime = ?, status = ?, closingBalance = ?, calculatedCash = ?, cashSales = ?, cardSales = ?, cashReturns = ?, difference = ? WHERE id = ?`;
            await db.run(sql, endTime, 'Closed', closingBalance, calculatedCash, cashSales, cardSales, cashReturns, difference, req.params.id);

            const updatedShift = await db.get('SELECT * FROM pos_shifts WHERE id = ?', req.params.id);
            res.json(updatedShift);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });


    // --- USER PROFILE ---
    app.put('/api/users/:id', async (req, res) => {
        const { name, avatar, phone } = req.body;
        const { id } = req.params;
        try {
            await db.run('UPDATE users SET name = ?, avatar = ?, phone = ? WHERE id = ?', name, avatar, phone, id);
            const updatedUser = await db.get('SELECT id, name, role, email, phone, avatar, status FROM users WHERE id = ?', id);
            res.json(updatedUser);
        } catch (err) {
             res.status(500).json({ error: err.message });
        }
    });
    
    app.put('/api/users/:id/change-password', async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const { id } = req.params;
        try {
            const user = await db.get('SELECT password FROM users WHERE id = ?', id);
            if (!user) {
                return res.status(404).json({ error: 'المستخدم غير موجود.'});
            }
            if (user.password !== currentPassword) {
                return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة.' });
            }
            await db.run('UPDATE users SET password = ? WHERE id = ?', newPassword, id);
            res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    
    // --- PASSWORD RECOVERY ---
    // This is a simulation. In a real app, you'd generate a secure token, store it, and email/SMS it.
    const recoveryCodes = new Map(); // In-memory store for codes
    
    app.post('/api/recover/request-code', async (req, res) => {
        const { identifier } = req.body; // Can be username, email or phone
        try {
            const user = await db.get('SELECT id FROM users WHERE name = ? OR email = ? OR phone = ?', identifier, identifier, identifier);
            if (!user) {
                return res.status(404).json({ error: 'المستخدم غير موجود.' });
            }
            const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
            recoveryCodes.set(identifier, code);
            console.log(`Recovery code for ${identifier} is: ${code}`); // Simulate sending
            setTimeout(() => recoveryCodes.delete(identifier), 300000); // Code expires in 5 minutes
            res.status(200).json({ message: 'تم إرسال رمز التحقق.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/recover/verify-code', (req, res) => {
        const { identifier, code } = req.body;
        if (recoveryCodes.has(identifier) && recoveryCodes.get(identifier) === code) {
            res.status(200).json({ message: 'الرمز صحيح.' });
        } else {
            res.status(400).json({ error: 'رمز التحقق غير صحيح أو منتهي الصلاحية.' });
        }
    });

    app.post('/api/recover/reset-password', async (req, res) => {
        const { identifier, code, newPassword } = req.body;
        if (recoveryCodes.has(identifier) && recoveryCodes.get(identifier) === code) {
            try {
                await db.run('UPDATE users SET password = ? WHERE name = ? OR email = ? OR phone = ?', newPassword, identifier, identifier, identifier);
                recoveryCodes.delete(identifier); // Invalidate code after use
                res.status(200).json({ message: 'تم إعادة تعيين كلمة المرور بنجاح.' });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        } else {
            res.status(400).json({ error: 'رمز التحقق غير صحيح أو منتهي الصلاحية.' });
        }
    });


    // --- ADMIN USER MANAGEMENT ---
    app.post('/api/users', async (req, res) => {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'الرجاء إدخال جميع الحقول المطلوبة.' });
        }
        try {
            const existing = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase());
            if (existing) {
                return res.status(409).json({ error: 'البريد الإلكتروني مستخدم بالفعل.' });
            }
            const avatar = `https://i.pravatar.cc/150?u=${Date.now()}`;
            const status = 'Active';
            const sql = `INSERT INTO users (name, email, password, role, status, avatar) VALUES (?, ?, ?, ?, ?, ?)`;
            const result = await db.run(sql, name, email.toLowerCase(), password, role, status, avatar);
            const newUser = await db.get('SELECT id, name, role, email, avatar, status FROM users WHERE id = ?', result.lastID);
            res.status(201).json(newUser);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.put('/api/users/:id/admin-update', async (req, res) => {
        const { name, role, status } = req.body;
        const { id } = req.params;
        try {
            await db.run('UPDATE users SET name = ?, role = ?, status = ? WHERE id = ?', name, role, status, id);
            const updatedUser = await db.get('SELECT id, name, role, email, avatar, status FROM users WHERE id = ?', id);
            res.json(updatedUser);
        } catch (err) {
             res.status(500).json({ error: err.message });
        }
    });

    // --- SYSTEM SETTINGS ---
    app.put('/api/settings', async (req, res) => {
        const settings = req.body;
        try {
            await db.run('UPDATE app_data SET value = ? WHERE key = ?', JSON.stringify(settings), 'systemSettings');
            res.json(settings);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });


    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);