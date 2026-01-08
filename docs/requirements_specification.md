# Requirements Specification

## 1. Introduction
This document outlines the functional and non-functional requirements for the Point of Sale (POS) system. The system is designed to manage sales, inventory, customers, and employees for a retail business.

## 2. System Overview
The POS system is a web-based application consisting of a React frontend and a Django backend. It supports multiple user roles, inventory tracking, sales processing, and reporting.

## 3. User Roles and Permissions
The system supports the following user roles:

### 3.1. Admin
- Full access to all system features.
- User management (create, update, delete accounts).
- Configuration settings (taxes, categories).
- View all reports and dashboards.

### 3.2. Manager
- Inventory management (add/edit items, adjust stock).
- View sales reports and transactions.
- Customer management.
- Restricted from managing other system admin users.

### 3.3. Cashier
- Restricted access, primarily focused on the Checkout interface.
- Process sales and returns.
- View personal transaction history.
- Cannot modify inventory master data or access detailed analytics.

## 4. Functional Requirements

### 4.1. Authentication & Security
- **Login:** Users must log in using a username and password.
- **Account Switching:** Support for quick account switching (e.g., for shared terminals).
- **Session Management:** Secure JWT-based authentication with auto-logout features.
- **PIN/Password Protection:** Sensitive actions may require re-authentication.

### 4.2. Inventory Management
- **Item Tracking:** Track products by SKU, name, category, and barcodes.
- **Stock Levels:** Real-time tracking of quantity, min/max stock levels.
- **Adjustments:** Record stock adjustments (additions, damages, removals, etc.) with reason codes.
- **Categories & Taxes:** Manage product categories and applicable tax rates.
- **Low Stock Alerts:** Indicators for items falling below minimum stock levels.

### 4.3. Sales & Checkout
- **Cart Management:** Add items to cart via search or barcode scan.
- **Customer Selection:** Associate a sale with a registered customer.
- **Payments:** Support multiple payment methods (Cash, Card, M-Pesa, EcoCash, EFT).
- **Discounts:** Apply discounts to transactions.
- **Receipts:** Generate transaction records (digital).
- **Saved Carts:** Ability to save a cart and resume it later.

### 4.4. specific Customer Management
- **Profiles:** Maintain customer details (Name, contact info, notes).
- **History:** Track purchase history and total spending.
- **Groups:** Categorize customers into groups.

### 4.5. Reporting & Dashboard
- **Dashboard:** Overview of daily sales, total revenue, and key metrics.
- **Transactions:** searchable history of all completed transactions.
- **Permissions:** Dashboard visibility is restricted based on user role.

## 5. Non-Functional Requirements
- **Performance:** Fast product search and checkout processing.
- **Interface:** Responsive and touch-friendly UI for tablets/desktops.
- **Reliability:** Data consistency for inventory and financial records.
- **Security:** Password hashing and secure API communication.
