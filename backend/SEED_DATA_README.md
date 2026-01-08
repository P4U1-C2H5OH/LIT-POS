# Mock Data Generation - Usage Guide

## Overview
The `seed_data.py` script generates comprehensive, realistic mock data for the POS system backend, suitable for development, testing, and demonstrations.

## Running the Script

```bash
cd /home/p4u1/Documents/me/POS/POS/backend
/home/p4u1/tools/bin/python seed_data.py
```

## Generated Data Summary

### Tax Rates (5 types)
- **Standard VAT**: 15% - Applied to most general items
- **Reduced VAT**: 5% - Applied to essential medicines and first aid
- **Luxury Tax**: 20% - Applied to premium skincare and cosmetic items
- **Tax Exempt**: 0% - Applied to prescription medicines and medical devices

### Categories (10 types)
1. Prescription Medicine
2. Over-the-Counter Medicine
3. Vitamins & Supplements
4. Personal Care
5. First Aid
6. Medical Devices
7. Baby Care
8. Skincare
9. Dental Care
10. Eye Care

### Staff Accounts (6 users)
All accounts use password: `password123`

- **admin** - System Administrator (ADMIN role)
- **sarah.johnson** - Sarah Johnson (MANAGER role)
- **michael.chen** - Michael Chen (CASHIER role)
- **emily.rodriguez** - Emily Rodriguez (CASHIER role)
- **james.williams** - James Williams (CASHIER role)
- **lisa.anderson** - Lisa Anderson (MANAGER role)

### Customers (32 customers)
Customers are organized into groups with realistic Lesotho names and phone numbers:

- **VIP Customers** (2): High-value customers with 50+ purchases and M20,000+ spent
- **Premium Customers** (4): Regular customers with 35+ purchases and M12,000+ spent
- **Regular Customers** (20): Active customers with varying purchase histories
- **New Customers** (6): Recent customers with 1-4 purchases

Each customer includes:
- Realistic Lesotho name (e.g., Thabo Mokoena, Palesa Nkosi)
- Valid email address
- Lesotho phone number format (+266 XXXX XXXX)
- Customer group classification
- Purchase history (total_spent, purchase_count)
- Avatar image URL

### Inventory Items (57 items)
Comprehensive product catalog with realistic details:

#### Key Features:
- **Realistic pricing**: Unit costs and selling prices with appropriate margins
- **Stock levels**: Varying quantities with min/max stock thresholds
- **Proper categorization**: Items correctly assigned to categories
- **Tax assignments**: Appropriate tax rates based on item type
- **Supplier information**: 6 different suppliers
- **Storage locations**: 16 different shelf/storage locations
- **Barcodes**: Randomly generated 12-digit barcodes
- **Restock dates**: Random dates within the last 60 days

#### Sample Items by Category:
- **Prescription**: Amoxicillin, Metformin, Lisinopril, Atorvastatin, Omeprazole
- **OTC Medicine**: Paracetamol, Ibuprofen, Aspirin, Antihistamine, Cough Syrup
- **Supplements**: Multivitamin, Vitamin C, Vitamin D3, Omega-3, Calcium
- **Medical Devices**: Thermometer, Blood Pressure Monitor, Pulse Oximeter, Glucose Meter
- **Personal Care**: Hand Sanitizer, Antibacterial Soap, Wet Wipes, Tissues
- **First Aid**: Bandages, Gauze Pads, Medical Tape, Antiseptic Solution
- **Baby Care**: Diapers, Baby Wipes, Baby Lotion, Baby Shampoo
- **Skincare**: Moisturizing Cream, Sunscreen, Anti-Aging Serum, Lip Balm
- **Dental Care**: Toothpaste, Toothbrush, Mouthwash, Dental Floss
- **Eye Care**: Eye Drops, Contact Lens Solution, Reading Glasses

## Data Characteristics

### Realistic Business Data
- ✅ No placeholder values like "test1", "foo", or "abc"
- ✅ Culturally appropriate names for Lesotho context
- ✅ Valid phone number formats (+266 prefix)
- ✅ Realistic pricing in Lesotho Loti (M)
- ✅ Appropriate profit margins (typically 40-100%)
- ✅ Varied stock levels reflecting real inventory patterns

### Valid Relationships
- ✅ All inventory items linked to valid tax records
- ✅ All inventory items assigned to appropriate categories
- ✅ Customers have realistic purchase histories
- ✅ Stock levels respect min/max constraints

### Testing Scenarios Supported
- **List Operations**: Sufficient items for pagination testing
- **Filter Operations**: Multiple categories, tax rates, and customer groups
- **Search Operations**: Varied SKUs, names, and barcodes
- **Transaction Testing**: Multiple customers with different profiles
- **Inventory Management**: Items with varying stock levels (low stock, adequate, overstocked)
- **Analytics**: Customer segmentation, sales patterns, inventory turnover

## Notes

- The script uses `get_or_create()` to avoid duplicates on repeated runs
- Existing data will not be overwritten
- Some timezone warnings may appear but are harmless
- All monetary values use Decimal for precision
- Images use Unsplash URLs for realistic product photos

## Resetting Data

To completely reset and regenerate data:

```bash
# Delete the database
rm db.sqlite3

# Run migrations
/home/p4u1/tools/bin/python manage.py migrate

# Run seed script
/home/p4u1/tools/bin/python seed_data.py
```
