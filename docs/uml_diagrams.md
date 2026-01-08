# UML Diagrams

This document contains Unified Modeling Language (UML) diagrams representing the system's structure and behavior.

## 1. Class Diagram
Represents the database schema and relationships between entities.

```mermaid
classDiagram
    direction BT
    class Account {
        +String username
        +String password
        +String role
        +String name
        +String profile_picture
    }
    class Customer {
        +String name
        +String email
        +String phone
        +Decimal total_spent
    }
    class InventoryItem {
        +String sku
        +String name
        +Decimal selling_price
        +Integer quantity
        +String barcode
    }
    class Category {
        +String name
    }
    class Tax {
        +String name
        +Decimal rate
    }
    class Transaction {
        +String transaction_number
        +Decimal total
        +String payment_method
        +DateTime date
        +String status
    }
    class TransactionItem {
        +Integer quantity
        +Decimal price_at_sale
    }
    class SavedCart {
        +String cart_number
        +DateTime saved_date
    }
    
    InventoryItem --> Category : belongs to
    InventoryItem --> Tax : applies
    Transaction --> Customer : linked to
    Transaction --> Account : processed by
    TransactionItem --> Transaction : part of
    TransactionItem --> InventoryItem : references
    SavedCart --> Customer : linked to
    SavedCart --> Account : created by
```

## 2. Sequence Diagrams

### 2.1. Authentication Flow
Interaction between User, Frontend, and Backend during login.

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant API as Django API
    participant DB as Database

    User->>Frontend: Enters Username/Password
    Frontend->>API: POST /api/login/ {username, password}
    API->>DB: Validate Credentials
    DB-->>API: User Valid
    API-->>Frontend: Returns JWT Token & User Profile
    Frontend->>Frontend: Store Token in LocalStorage
    Frontend-->>User: Redirect to Dashboard/Checkout
```

### 2.2. Sale Transaction Flow
Process of completing a sale.

```mermaid
sequenceDiagram
    actor Cashier
    participant UI as Checkout UI
    participant Handler as Transaction Handler
    participant API as POS API
    participant DB as Database

    Cashier->>UI: Scans Item / Adds to Cart
    UI->>Handler: Add Item (Calculate Tax/Total)
    Cashier->>UI: Selects Customer (Optional)
    Cashier->>UI: Clicks "Process Payment"
    UI->>Cashier: Shows Payment Modal
    Cashier->>UI: Selects Method & Confirms
    UI->>API: POST /api/transactions/
    API->>DB: Create Transaction Record
    API->>DB: Create Transaction Items
    API->>DB: Update Inventory Quantity
    DB-->>API: Success
    API-->>UI: Return Transaction Details
    UI->>Cashier: Show Success & Print Receipt
```

## 3. Activity Diagram (Checkout Process)
Workflow logic for the cashier during checkout.

```mermaid
stateDiagram-v2
    [*] --> StartCheckout
    StartCheckout --> AddItems: Scan/Search Product
    AddItems --> AddItems: Add more items
    AddItems --> SelectCustomer: (Optional)
    SelectCustomer --> ReviewCart
    AddItems --> ReviewCart
    ReviewCart --> Payment: Proceed to Pay
    Payment --> Choice: Select Method
    Choice --> Cash
    Choice --> Card
    Choice --> MobileMoney
    Cash --> ValidatePayment
    Card --> ValidatePayment
    MobileMoney --> ValidatePayment
    ValidatePayment --> CompleteTransaction: Success
    ValidatePayment --> Payment: Failed (Retry)
    CompleteTransaction --> PrintReceipt
    PrintReceipt --> [*]
```

## 4. Use Case Diagram
High-level system capabilities by user role.

```mermaid
usecaseDiagram
    actor Admin
    actor Cashier
    actor Manager

    package "POS System" {
        usecase "Manage Inventory" as UI1
        usecase "Manage Accounts" as UI2
        usecase "View Analytics" as UI3
        usecase "Process Sale" as UI4
        usecase "View Transactions" as UI5
        usecase "Manage Customers" as UI6
    }

    Admin --> UI2
    Admin --> UI1
    Admin --> UI3
    Admin --> UI6

    Manager --> UI1
    Manager --> UI3
    Manager --> UI6
    Manager --> UI5

    Cashier --> UI4
    Cashier --> UI5
    Cashier --> UI6
```
