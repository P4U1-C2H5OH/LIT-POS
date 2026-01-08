# System Architecture Overview

## 1. High-Level Architecture
The POS system follows a traditional client-server architecture, separated into a Frontend Presentation Layer and a Backend Service Layer. Communication is established via a RESTful API.

```
[ Client: Web Browser ]
        |
    (HTTP / HTTPS)
        |
        v
[ Backend: Django REST API ] <---> [ Database: SQLite ]
```

## 2. Frontend Layer (Client)
The frontend is a Single Page Application (SPA) built to provide a dynamic and responsive user experience.

- **Framework:** React 18 (via Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI (headless primitives) with custom styling (Shadcn/ui patterns)
- **Icons:** Lucide React
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)
- **HTTP Client:** Custom `api.ts` module using `fetch`

### Key Modules:
- **`App.tsx`:** Main entry point handling routing and global auth state.
- **`components/`:** Reusable UI components (Dashboard, Checkout, Inventory, etc.).
- **`api.ts`:** Centralized API handling and token management.

## 3. Backend Layer (Server)
The backend serves as the core logic provider, handling data persistence, authentication, and business rules.

- **Framework:** Django 5.x
- **API Toolkit:** Django REST Framework (DRF)
- **Language:** Python 3.x
- **Authentication:** SimpleJWT (JSON Web Tokens)
- **Database:** SQLite (Development/Default) - scalable to PostgreSQL.

### Key Applications:
- **`pos_api`:** The primary Django app containing all models, views, and serializers.
- **`manage.py`:** Command-line utility for administrative tasks.

## 4. Data Layer
The system uses a relational database model to store structured data.

- **Tables:** Accounts, Customers, Transactions, InventoryItems, Categories, Taxes, SavedCarts.
- **Relationships:**
    - Transactions link to Customers and Accounts.
    - InventoryItems link to Categories and Taxes.
    - SavedCarts link to Customers and Accounts.

## 5. Security & Deployment
- **CORS:** Configured to allow requests from the frontend origin.
- **Environment Variables:** Used for secrets (though currently hardcoded in dev).
- **Static Files:** Served via WhiteNoise or web server in production.
