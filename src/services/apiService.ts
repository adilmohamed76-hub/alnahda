import type { Product, Supplier, Customer, SalesOrder, User, UserRole, SystemSettings, PosShift } from '../types/index';

const API_URL = 'http://localhost:3001/api';

// --- General Data Fetching ---
export async function fetchAllData() {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return response.json();
}

// --- Products ---
export async function fetchProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

export async function saveProduct(product: Omit<Product, 'id'> & { id?: number }): Promise<Product> {
    const url = product.id ? `${API_URL}/products/${product.id}` : `${API_URL}/products`;
    const method = product.id ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to save product');
    return response.json();
}

export async function deleteProduct(productId: number): Promise<void> {
    const response = await fetch(`${API_URL}/products/${productId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete product');
}

// --- Suppliers ---
export async function saveSupplier(supplier: Omit<Supplier, 'id'> & { id?: number }): Promise<Supplier> {
    const url = supplier.id ? `${API_URL}/suppliers/${supplier.id}` : `${API_URL}/suppliers`;
    const method = supplier.id ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier),
    });
    if (!response.ok) throw new Error('Failed to save supplier');
    return response.json();
}

export async function deleteSupplier(supplierId: number): Promise<void> {
    const response = await fetch(`${API_URL}/suppliers/${supplierId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete supplier');
}

// --- Customers ---
export async function saveCustomer(customer: Omit<Customer, 'id'> & { id?: number }): Promise<Customer> {
    const url = customer.id ? `${API_URL}/customers/${customer.id}` : `${API_URL}/customers`;
    const method = customer.id ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error('Failed to save customer');
    return response.json();
}

export async function deleteCustomer(customerId: number): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${customerId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete customer');
}


// --- Sales Orders ---
export async function saveSalesOrder(order: Omit<SalesOrder, 'id'> & { id?: number }): Promise<SalesOrder> {
    const url = order.id ? `${API_URL}/sales/${order.id}` : `${API_URL}/sales`;
    const method = order.id ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to save sales order');
    return response.json();
}

export async function updateSalesOrderStatus(orderId: number, status: SalesOrder['status']): Promise<void> {
    const response = await fetch(`${API_URL}/sales/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update sales order status');
}

// --- POS Shifts ---
export async function getActiveShift(userId: number): Promise<PosShift | null> {
    const response = await fetch(`${API_URL}/pos/active-shift/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch active shift');
    return response.json();
}

export async function startShift(data: { userId: number; userName: string; openingBalance: number }): Promise<PosShift> {
    const response = await fetch(`${API_URL}/pos/start-shift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start shift');
    }
    return response.json();
}

export async function endShift(shiftId: number, data: { closingBalance: number }): Promise<PosShift> {
    const response = await fetch(`${API_URL}/pos/end-shift/${shiftId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to end shift');
    }
    return response.json();
}


// --- Users & Auth ---
export async function authenticateUser(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل المصادقة');
    }
    return response.json();
}

export async function registerUser(name: string, email: string, password: string, phone?: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل إنشاء الحساب');
    }
    return response.json();
}

export async function updateUserProfile(userData: Pick<User, 'id' | 'name' | 'avatar' | 'phone'>): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userData.name, avatar: userData.avatar, phone: userData.phone }),
    });
    if (!response.ok) throw new Error('Failed to update user profile');
    return response.json();
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل تغيير كلمة المرور');
    }
}

// --- Password Recovery ---
export async function requestRecoveryCode(identifier: string): Promise<void> {
    const response = await fetch(`${API_URL}/recover/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل إرسال الرمز');
    }
}

export async function verifyRecoveryCode(identifier: string, code: string): Promise<void> {
    const response = await fetch(`${API_URL}/recover/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'الرمز غير صحيح');
    }
}

export async function resetPassword(identifier: string, code: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/recover/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code, newPassword }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل إعادة تعيين كلمة المرور');
    }
}


export async function createUser(userData: { name: string, email: string, password: string, role: UserRole }): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
    }
    return response.json();
}

export async function updateUser(userData: Pick<User, 'id'|'name'|'role'|'status'>): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userData.id}/admin-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: userData.name,
            role: userData.role,
            status: userData.status,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
    }
    return response.json();
}

// --- System Settings ---
export async function updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
    const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    if (!response.ok) {
        throw new Error('Failed to update system settings');
    }
    return response.json();
}
