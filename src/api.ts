const API_BASE_URL = 'http://localhost:8000/api';

export interface Account {
    id: string | number;
    username: string;
    name: string;
    email: string;
    profilePicture: string;
    lastAccess: string | null;
    role: string;
    dailyStats: {
        totalSales: number;
        transactions: number;
        itemsSold: number;
    };
}

export interface Category {
    id: number;
    name: string;
}

export interface Tax {
    id: number;
    name: string;
    rate: string;
}

export interface Item {
    id: string | number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: number;
    categoryName: string;
    tax: number;
    taxRate: number;
    unit: string;
    image: string;
    min_stock?: number;
    max_stock?: number;
    unit_cost?: string;
    supplier?: string;
    location?: string;
    barcode?: string;
    last_restocked?: string;
}

export interface Customer {
    id: string | number;
    name: string;
    email: string;
    phone: string;
    group?: string;
    notes?: string;
    avatar?: string;
    customerSince?: string;
    lastVisit?: string;
    avgSpend?: number;
    total_spent?: string;
    purchase_count?: number;
}

export interface Transaction {
    id: string | number;
    transactionNumber: string;
    date: string;
    customer: number | null;
    customerName: string;
    customerAvatar: string;
    account: number;
    accountName: string;
    paymentMethod: string;
    subtotal: string;
    tax: string;
    discount: string;
    total: string;
    status: string;
    items: Array<{
        id: number;
        item: number;
        itemName: string;
        quantity: number;
        price_at_sale: string;
    }>;
}

export interface SavedCart {
    id: string | number;
    cartNumber: string;
    savedDate: string;
    customer: number | null;
    customerName: string;
    customerAvatar: string;
    account: number;
    accountName: string;
    subtotal: string;
    tax: string;
    discount: string;
    total: string;
    notes?: string;
    items: Array<{
        id: number;
        item: number;
        itemName: string;
        quantity: number;
    }>;
}

export interface DashboardMetrics {
    today: {
        revenue: number;
        transactions: number;
    };
    myContribution: {
        revenue: number;
        transactions: number;
        itemsSold: number;
    };
    inventory: {
        current_value_at_cost: number;
        potential_revenue: number;
        low_stock_count: number;
    };
    summary: {
        total_sales: number;
        total_customers: number;
        total_transactions: number;
        gross_profit: number;
    };
    top_items: Array<{
        name: string;
        sku: string;
        unit: string;
        quantity: number;
        revenue: number;
    }>;
}

class ApiService {
    private token: string | null = localStorage.getItem('access_token');

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('access_token', token);
        } else {
            localStorage.removeItem('access_token');
        }
    }

    getToken() {
        return this.token;
    }

    private static CACHE_KEY = 'pos_cached_users';

    getCachedAccounts(): Account[] {
        const cached = localStorage.getItem(ApiService.CACHE_KEY);
        return cached ? JSON.parse(cached) : [];
    }

    cacheAccount(user: Account) {
        const accounts = this.getCachedAccounts();
        const index = accounts.findIndex(a => a.id === user.id);
        if (index > -1) {
            accounts[index] = { ...accounts[index], ...user };
        } else {
            accounts.push(user);
        }
        localStorage.setItem(ApiService.CACHE_KEY, JSON.stringify(accounts));
    }

    removeFromCache(accountId: string | number) {
        const accounts = this.getCachedAccounts();
        const filtered = accounts.filter(a => a.id !== accountId);
        localStorage.setItem(ApiService.CACHE_KEY, JSON.stringify(filtered));
    }

    clearSession() {
        this.setToken(null);
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...((options.headers as any) || {}),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (options.body instanceof FormData) {
            delete (headers as any)['Content-Type'];
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            this.setToken(null);
            window.location.reload(); // Refresh to trigger login redirect if needed
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
                url: `${API_BASE_URL}${endpoint}`
            });

            try {
                const error = JSON.parse(errorText);
                const errorMessage = error.detail || error.message || JSON.stringify(error);
                throw new Error(`API Error (${response.status}): ${errorMessage}`);
            } catch (parseError) {
                throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
            }
        }

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        return response.json();
    }

    async login(username: string, password: string) {
        const data = await this.request('/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        this.setToken(data.access);
        return data;
    }

    async getAccounts(): Promise<Account[]> {
        return this.request('/accounts/');
    }

    async getCategories(): Promise<Category[]> {
        return this.request('/categories/');
    }

    async getTaxes(): Promise<Tax[]> {
        return this.request('/taxes/');
    }

    async getInventory(): Promise<Item[]> {
        return this.request('/inventory/');
    }

    async getCustomers(): Promise<Customer[]> {
        return this.request('/customers/');
    }

    async createCustomer(data: Partial<Customer>): Promise<Customer> {
        return this.request('/customers/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getTransactions(): Promise<Transaction[]> {
        return this.request('/transactions/');
    }

    async getDashboardMetrics(): Promise<DashboardMetrics> {
        return this.request('/dashboard/');
    }

    async createTransaction(data: any): Promise<Transaction> {
        return this.request('/transactions/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async saveCart(data: any) {
        return this.request('/saved-carts/', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }

    async deleteSavedCart(id: string | number) {
        return this.request(`/saved-carts/${id}/`, {
            method: 'DELETE',
        });
    }

    async getSavedCarts() {
        return this.request('/saved-carts/')
    }

    async getStockAdjustments(): Promise<StockAdjustment[]> {
        return this.request('/stock-adjustments/');
    }

    async createInventoryItem(data: any): Promise<Item> {
        return this.request('/inventory/', {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    async adjustStock(data: any): Promise<StockAdjustment> {
        return this.request('/stock-adjustments/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateInventoryItem(id: string | number, data: any): Promise<Item> {
        return this.request(`/inventory/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

export interface StockAdjustment {
    id: string | number;
    itemId: string | number;
    itemName: string;
    itemSku: string;
    type: "ADDITION" | "REMOVAL" | "DAMAGE" | "TRANSFER" | "RETURN" | "DISPOSAL";
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string;
    adjustedBy: string;
    adjustedDate: string;
    notes?: string;
    priceChange?: {
        previousPrice: number;
        newPrice: number;
    };
}

export const api = new ApiService();
