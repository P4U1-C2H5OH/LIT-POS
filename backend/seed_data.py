import os
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pos_project.settings')
django.setup()

from pos_api.models import Account, Tax, Category, InventoryItem, Customer

def seed():
    print("Starting database seeding...")
    
    # ============================================
    # TAXES
    # ============================================
    print("Creating tax rates...")
    taxes = {
        'standard': Tax.objects.get_or_create(name='Standard VAT', defaults={'rate': Decimal('0.15')})[0],
        'reduced': Tax.objects.get_or_create(name='Reduced VAT', defaults={'rate': Decimal('0.05')})[0],
        'luxury': Tax.objects.get_or_create(name='Luxury Tax', defaults={'rate': Decimal('0.20')})[0],
        'exempt': Tax.objects.get_or_create(name='Tax Exempt', defaults={'rate': Decimal('0.00')})[0],
    }
    print(f"✓ Created {len(taxes)} tax rates")

    # ============================================
    # CATEGORIES
    # ============================================
    print("Creating categories...")
    category_names = [
        'Prescription Medicine',
        'Over-the-Counter Medicine',
        'Vitamins & Supplements',
        'Personal Care',
        'First Aid',
        'Medical Devices',
        'Baby Care',
        'Skincare',
        'Dental Care',
        'Eye Care'
    ]
    categories = {}
    for cat_name in category_names:
        cat, _ = Category.objects.get_or_create(name=cat_name)
        categories[cat_name] = cat
    print(f"✓ Created {len(categories)} categories")

    # ============================================
    # ACCOUNTS (Staff)
    # ============================================
    print("Creating staff accounts...")
    accounts_data = [
        {'username': 'admin', 'name': 'System Administrator', 'email': 'admin@pharmacy.com', 'role': 'ADMIN', 
         'profile_picture': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'},
        {'username': 'sarah.johnson', 'name': 'Sarah Johnson', 'email': 'sarah.johnson@pharmacy.com', 'role': 'MANAGER', 
         'profile_picture': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'},
        {'username': 'michael.chen', 'name': 'Michael Chen', 'email': 'michael.chen@pharmacy.com', 'role': 'CASHIER', 
         'profile_picture': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'},
        {'username': 'emily.rodriguez', 'name': 'Emily Rodriguez', 'email': 'emily.rodriguez@pharmacy.com', 'role': 'CASHIER', 
         'profile_picture': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'},
        {'username': 'james.williams', 'name': 'James Williams', 'email': 'james.williams@pharmacy.com', 'role': 'CASHIER', 
         'profile_picture': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'},
        {'username': 'lisa.anderson', 'name': 'Lisa Anderson', 'email': 'lisa.anderson@pharmacy.com', 'role': 'MANAGER', 
         'profile_picture': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop'},
    ]
    
    for acc in accounts_data:
        if not Account.objects.filter(username=acc['username']).exists():
            Account.objects.create_user(
                username=acc['username'],
                password='password123',
                email=acc['email'],
                name=acc['name'],
                role=acc['role'],
                profile_picture=acc['profile_picture']
            )
    print(f"✓ Created {len(accounts_data)} staff accounts")

    # ============================================
    # CUSTOMERS
    # ============================================
    print("Creating customers...")
    customers_data = [
        # Premium Customers
        {'name': 'Thabo Mokoena', 'email': 'thabo.mokoena@email.com', 'phone': '+266 5812 3456', 'group': 'Premium', 
         'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
         'total_spent': Decimal('15420.50'), 'purchase_count': 47},
        {'name': 'Palesa Nkosi', 'email': 'palesa.nkosi@email.com', 'phone': '+266 5823 4567', 'group': 'Premium', 
         'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
         'total_spent': Decimal('12850.75'), 'purchase_count': 38},
        {'name': 'Lebohang Motaung', 'email': 'lebohang.motaung@email.com', 'phone': '+266 5834 5678', 'group': 'Premium', 
         'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
         'total_spent': Decimal('18950.25'), 'purchase_count': 52},
        {'name': 'Mamello Ramoeletsi', 'email': 'mamello.ramoeletsi@email.com', 'phone': '+266 5845 6789', 'group': 'Premium', 
         'avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
         'total_spent': Decimal('14200.00'), 'purchase_count': 41},
        
        # VIP Customers
        {'name': 'Thabiso Letsie', 'email': 'thabiso.letsie@email.com', 'phone': '+266 5856 7890', 'group': 'VIP', 
         'avatar': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
         'total_spent': Decimal('25600.80'), 'purchase_count': 68},
        {'name': 'Lineo Molefe', 'email': 'lineo.molefe@email.com', 'phone': '+266 5867 8901', 'group': 'VIP', 
         'avatar': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
         'total_spent': Decimal('22400.50'), 'purchase_count': 59},
        
        # Regular Customers
        {'name': 'Mpho Sekhonyana', 'email': 'mpho.sekhonyana@email.com', 'phone': '+266 5878 9012', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop',
         'total_spent': Decimal('3450.25'), 'purchase_count': 12},
        {'name': 'Refiloe Khati', 'email': 'refiloe.khati@email.com', 'phone': '+266 5889 0123', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
         'total_spent': Decimal('5680.00'), 'purchase_count': 18},
        {'name': 'Tshepo Mofolo', 'email': 'tshepo.mofolo@email.com', 'phone': '+266 5890 1234', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
         'total_spent': Decimal('4120.75'), 'purchase_count': 15},
        {'name': 'Nthabiseng Molapo', 'email': 'nthabiseng.molapo@email.com', 'phone': '+266 5801 2345', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
         'total_spent': Decimal('6250.50'), 'purchase_count': 21},
        {'name': 'Khotso Makhetha', 'email': 'khotso.makhetha@email.com', 'phone': '+266 5812 3457', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop',
         'total_spent': Decimal('2890.00'), 'purchase_count': 9},
        {'name': 'Puleng Tsotetsi', 'email': 'puleng.tsotetsi@email.com', 'phone': '+266 5823 4568', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
         'total_spent': Decimal('7340.25'), 'purchase_count': 24},
        {'name': 'Lerato Makhele', 'email': 'lerato.makhele@email.com', 'phone': '+266 5834 5679', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
         'total_spent': Decimal('4560.80'), 'purchase_count': 16},
        {'name': 'Teboho Ramabanta', 'email': 'teboho.ramabanta@email.com', 'phone': '+266 5845 6780', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop',
         'total_spent': Decimal('3780.50'), 'purchase_count': 13},
        {'name': 'Masechaba Mohlomi', 'email': 'masechaba.mohlomi@email.com', 'phone': '+266 5856 7891', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop',
         'total_spent': Decimal('5920.00'), 'purchase_count': 19},
        
        # New Customers
        {'name': 'Moliehi Ramokoena', 'email': 'moliehi.ramokoena@email.com', 'phone': '+266 5867 8902', 'group': 'New', 
         'avatar': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop',
         'total_spent': Decimal('450.00'), 'purchase_count': 2},
        {'name': 'Tumelo Mokhesi', 'email': 'tumelo.mokhesi@email.com', 'phone': '+266 5878 9013', 'group': 'New', 
         'avatar': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop',
         'total_spent': Decimal('320.50'), 'purchase_count': 1},
        {'name': 'Keketso Molapo', 'email': 'keketso.molapo@email.com', 'phone': '+266 5889 0124', 'group': 'New', 
         'avatar': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop',
         'total_spent': Decimal('680.75'), 'purchase_count': 3},
        {'name': 'Rethabile Nkuebe', 'email': 'rethabile.nkuebe@email.com', 'phone': '+266 5890 1235', 'group': 'New', 
         'avatar': 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop',
         'total_spent': Decimal('540.00'), 'purchase_count': 2},
        {'name': 'Moipone Letsie', 'email': 'moipone.letsie@email.com', 'phone': '+266 5801 2346', 'group': 'New', 
         'avatar': 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=100&h=100&fit=crop',
         'total_spent': Decimal('890.25'), 'purchase_count': 4},
        
        # Additional Regular Customers
        {'name': 'Bokang Mokhele', 'email': 'bokang.mokhele@email.com', 'phone': '+266 5812 3458', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop',
         'total_spent': Decimal('5120.00'), 'purchase_count': 17},
        {'name': 'Limakatso Moloi', 'email': 'limakatso.moloi@email.com', 'phone': '+266 5823 4569', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=100&h=100&fit=crop',
         'total_spent': Decimal('6780.50'), 'purchase_count': 22},
        {'name': 'Nthati Mofokeng', 'email': 'nthati.mofokeng@email.com', 'phone': '+266 5834 5670', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=100&h=100&fit=crop',
         'total_spent': Decimal('4890.75'), 'purchase_count': 16},
        {'name': 'Seabata Moshoeshoe', 'email': 'seabata.moshoeshoe@email.com', 'phone': '+266 5845 6781', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
         'total_spent': Decimal('3560.00'), 'purchase_count': 12},
        {'name': 'Maleshoane Tau', 'email': 'maleshoane.tau@email.com', 'phone': '+266 5856 7892', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop',
         'total_spent': Decimal('7120.25'), 'purchase_count': 23},
        {'name': 'Thapelo Sekake', 'email': 'thapelo.sekake@email.com', 'phone': '+266 5867 8903', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=100&h=100&fit=crop',
         'total_spent': Decimal('4340.50'), 'purchase_count': 14},
        {'name': 'Mpolokeng Ramaema', 'email': 'mpolokeng.ramaema@email.com', 'phone': '+266 5878 9014', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=100&h=100&fit=crop',
         'total_spent': Decimal('5670.00'), 'purchase_count': 18},
        {'name': 'Katleho Moeletsi', 'email': 'katleho.moeletsi@email.com', 'phone': '+266 5889 0125', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=100&h=100&fit=crop',
         'total_spent': Decimal('6450.75'), 'purchase_count': 20},
        {'name': 'Nkopane Mohale', 'email': 'nkopane.mohale@email.com', 'phone': '+266 5890 1236', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=100&h=100&fit=crop',
         'total_spent': Decimal('3920.00'), 'purchase_count': 13},
        {'name': 'Mathabo Nkau', 'email': 'mathabo.nkau@email.com', 'phone': '+266 5801 2347', 'group': 'Regular', 
         'avatar': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
         'total_spent': Decimal('5280.50'), 'purchase_count': 17},
    ]
    
    for cust_data in customers_data:
        Customer.objects.get_or_create(
            email=cust_data['email'],
            defaults=cust_data
        )
    print(f"✓ Created {len(customers_data)} customers")

    # ============================================
    # INVENTORY ITEMS
    # ============================================
    print("Creating inventory items...")
    
    # Suppliers
    suppliers = [
        'PharmaCorp International',
        'MediSupply Ltd',
        'HealthWare Distributors',
        'Global Pharma Solutions',
        'WellCare Suppliers',
        'MedTech Industries'
    ]
    
    # Locations
    locations = [
        'Shelf A1', 'Shelf A2', 'Shelf A3', 'Shelf A4',
        'Shelf B1', 'Shelf B2', 'Shelf B3', 'Shelf B4',
        'Shelf C1', 'Shelf C2', 'Shelf C3', 'Shelf C4',
        'Refrigerator 1', 'Refrigerator 2', 'Storage Room', 'Counter Display'
    ]
    
    items_data = [
        # Prescription Medicine
        {'sku': 'RX-001', 'name': 'Amoxicillin 500mg Capsules', 'category': 'Prescription Medicine', 'tax': 'exempt',
         'quantity': 240, 'unit': 'Capsules', 'min_stock': 50, 'max_stock': 500, 'unit_cost': Decimal('0.45'), 
         'selling_price': Decimal('0.85'), 'supplier': suppliers[0], 'location': locations[0],
         'image_url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'},
        
        {'sku': 'RX-002', 'name': 'Metformin 850mg Tablets', 'category': 'Prescription Medicine', 'tax': 'exempt',
         'quantity': 180, 'unit': 'Tablets', 'min_stock': 40, 'max_stock': 400, 'unit_cost': Decimal('0.32'), 
         'selling_price': Decimal('0.65'), 'supplier': suppliers[1], 'location': locations[0],
         'image_url': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop'},
        
        {'sku': 'RX-003', 'name': 'Lisinopril 10mg Tablets', 'category': 'Prescription Medicine', 'tax': 'exempt',
         'quantity': 150, 'unit': 'Tablets', 'min_stock': 30, 'max_stock': 350, 'unit_cost': Decimal('0.28'), 
         'selling_price': Decimal('0.55'), 'supplier': suppliers[0], 'location': locations[1],
         'image_url': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop'},
        
        {'sku': 'RX-004', 'name': 'Atorvastatin 20mg Tablets', 'category': 'Prescription Medicine', 'tax': 'exempt',
         'quantity': 200, 'unit': 'Tablets', 'min_stock': 45, 'max_stock': 450, 'unit_cost': Decimal('0.52'), 
         'selling_price': Decimal('0.95'), 'supplier': suppliers[2], 'location': locations[1],
         'image_url': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop'},
        
        {'sku': 'RX-005', 'name': 'Omeprazole 20mg Capsules', 'category': 'Prescription Medicine', 'tax': 'exempt',
         'quantity': 175, 'unit': 'Capsules', 'min_stock': 35, 'max_stock': 400, 'unit_cost': Decimal('0.38'), 
         'selling_price': Decimal('0.75'), 'supplier': suppliers[1], 'location': locations[2],
         'image_url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'},
        
        # Over-the-Counter Medicine
        {'sku': 'OTC-001', 'name': 'Paracetamol 500mg Tablets (Pack of 24)', 'category': 'Over-the-Counter Medicine', 'tax': 'reduced',
         'quantity': 320, 'unit': 'Packs', 'min_stock': 80, 'max_stock': 600, 'unit_cost': Decimal('2.80'), 
         'selling_price': Decimal('5.99'), 'supplier': suppliers[3], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'},
        
        {'sku': 'OTC-002', 'name': 'Ibuprofen 400mg Tablets (Pack of 16)', 'category': 'Over-the-Counter Medicine', 'tax': 'reduced',
         'quantity': 280, 'unit': 'Packs', 'min_stock': 70, 'max_stock': 550, 'unit_cost': Decimal('3.20'), 
         'selling_price': Decimal('6.99'), 'supplier': suppliers[3], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop'},
        
        {'sku': 'OTC-003', 'name': 'Aspirin 75mg Tablets (Pack of 28)', 'category': 'Over-the-Counter Medicine', 'tax': 'reduced',
         'quantity': 190, 'unit': 'Packs', 'min_stock': 50, 'max_stock': 400, 'unit_cost': Decimal('2.50'), 
         'selling_price': Decimal('4.99'), 'supplier': suppliers[4], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop'},
        
        {'sku': 'OTC-004', 'name': 'Antihistamine Allergy Relief 10mg (Pack of 30)', 'category': 'Over-the-Counter Medicine', 'tax': 'reduced',
         'quantity': 145, 'unit': 'Packs', 'min_stock': 40, 'max_stock': 350, 'unit_cost': Decimal('4.80'), 
         'selling_price': Decimal('9.99'), 'supplier': suppliers[2], 'location': locations[3],
         'image_url': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop'},
        
        {'sku': 'OTC-005', 'name': 'Cough Syrup 200ml', 'category': 'Over-the-Counter Medicine', 'tax': 'reduced',
         'quantity': 95, 'unit': 'Bottles', 'min_stock': 25, 'max_stock': 200, 'unit_cost': Decimal('5.60'), 
         'selling_price': Decimal('11.99'), 'supplier': suppliers[1], 'location': locations[4],
         'image_url': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop'},
        
        {'sku': 'OTC-006', 'name': 'Antacid Tablets (Pack of 48)', 'category': 'Over-the-Counter Medicine', 'tax': 'reduced',
         'quantity': 165, 'unit': 'Packs', 'min_stock': 45, 'max_stock': 350, 'unit_cost': Decimal('3.90'), 
         'selling_price': Decimal('7.99'), 'supplier': suppliers[3], 'location': locations[4],
         'image_url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'},
        
        # Vitamins & Supplements
        {'sku': 'SUP-001', 'name': 'Multivitamin Complex (60 Tablets)', 'category': 'Vitamins & Supplements', 'tax': 'standard',
         'quantity': 120, 'unit': 'Bottles', 'min_stock': 30, 'max_stock': 250, 'unit_cost': Decimal('8.50'), 
         'selling_price': Decimal('16.99'), 'supplier': suppliers[4], 'location': locations[5],
         'image_url': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop'},
        
        {'sku': 'SUP-002', 'name': 'Vitamin C 1000mg (90 Tablets)', 'category': 'Vitamins & Supplements', 'tax': 'standard',
         'quantity': 155, 'unit': 'Bottles', 'min_stock': 40, 'max_stock': 300, 'unit_cost': Decimal('6.80'), 
         'selling_price': Decimal('13.99'), 'supplier': suppliers[4], 'location': locations[5],
         'image_url': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop'},
        
        {'sku': 'SUP-003', 'name': 'Vitamin D3 2000IU (120 Capsules)', 'category': 'Vitamins & Supplements', 'tax': 'standard',
         'quantity': 98, 'unit': 'Bottles', 'min_stock': 25, 'max_stock': 200, 'unit_cost': Decimal('7.20'), 
         'selling_price': Decimal('14.99'), 'supplier': suppliers[5], 'location': locations[6],
         'image_url': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop'},
        
        {'sku': 'SUP-004', 'name': 'Omega-3 Fish Oil (100 Softgels)', 'category': 'Vitamins & Supplements', 'tax': 'standard',
         'quantity': 85, 'unit': 'Bottles', 'min_stock': 20, 'max_stock': 180, 'unit_cost': Decimal('9.40'), 
         'selling_price': Decimal('18.99'), 'supplier': suppliers[5], 'location': locations[6],
         'image_url': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop'},
        
        {'sku': 'SUP-005', 'name': 'Calcium + Vitamin D (90 Tablets)', 'category': 'Vitamins & Supplements', 'tax': 'standard',
         'quantity': 110, 'unit': 'Bottles', 'min_stock': 30, 'max_stock': 220, 'unit_cost': Decimal('7.80'), 
         'selling_price': Decimal('15.99'), 'supplier': suppliers[4], 'location': locations[7],
         'image_url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'},
        
        {'sku': 'SUP-006', 'name': 'Magnesium 400mg (60 Tablets)', 'category': 'Vitamins & Supplements', 'tax': 'standard',
         'quantity': 92, 'unit': 'Bottles', 'min_stock': 25, 'max_stock': 200, 'unit_cost': Decimal('6.50'), 
         'selling_price': Decimal('12.99'), 'supplier': suppliers[5], 'location': locations[7],
         'image_url': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop'},
        
        {'sku': 'SUP-007', 'name': 'Probiotics 10 Billion CFU (30 Capsules)', 'category': 'Vitamins & Supplements', 'tax': 'standard',
         'quantity': 68, 'unit': 'Bottles', 'min_stock': 15, 'max_stock': 150, 'unit_cost': Decimal('12.50'), 
         'selling_price': Decimal('24.99'), 'supplier': suppliers[5], 'location': locations[12],
         'image_url': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop'},
        
        # Personal Care
        {'sku': 'PC-001', 'name': 'Hand Sanitizer 500ml', 'category': 'Personal Care', 'tax': 'standard',
         'quantity': 245, 'unit': 'Bottles', 'min_stock': 60, 'max_stock': 500, 'unit_cost': Decimal('4.20'), 
         'selling_price': Decimal('8.99'), 'supplier': suppliers[2], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=200&h=200&fit=crop'},
        
        {'sku': 'PC-002', 'name': 'Antibacterial Soap 250ml', 'category': 'Personal Care', 'tax': 'standard',
         'quantity': 180, 'unit': 'Bottles', 'min_stock': 45, 'max_stock': 400, 'unit_cost': Decimal('3.60'), 
         'selling_price': Decimal('7.49'), 'supplier': suppliers[2], 'location': locations[8],
         'image_url': 'https://images.unsplash.com/photo-1585155770960-d5e41c5c7f00?w=200&h=200&fit=crop'},
        
        {'sku': 'PC-003', 'name': 'Wet Wipes (Pack of 80)', 'category': 'Personal Care', 'tax': 'standard',
         'quantity': 210, 'unit': 'Packs', 'min_stock': 55, 'max_stock': 450, 'unit_cost': Decimal('2.80'), 
         'selling_price': Decimal('5.99'), 'supplier': suppliers[3], 'location': locations[8],
         'image_url': 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=200&h=200&fit=crop'},
        
        {'sku': 'PC-004', 'name': 'Tissues (Box of 200)', 'category': 'Personal Care', 'tax': 'standard',
         'quantity': 165, 'unit': 'Boxes', 'min_stock': 40, 'max_stock': 350, 'unit_cost': Decimal('1.90'), 
         'selling_price': Decimal('3.99'), 'supplier': suppliers[3], 'location': locations[9],
         'image_url': 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=200&h=200&fit=crop'},
        
        {'sku': 'PC-005', 'name': 'Cotton Swabs (Pack of 200)', 'category': 'Personal Care', 'tax': 'standard',
         'quantity': 135, 'unit': 'Packs', 'min_stock': 35, 'max_stock': 300, 'unit_cost': Decimal('2.40'), 
         'selling_price': Decimal('4.99'), 'supplier': suppliers[2], 'location': locations[9],
         'image_url': 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=200&h=200&fit=crop'},
        
        # First Aid
        {'sku': 'FA-001', 'name': 'Adhesive Bandages (Pack of 100)', 'category': 'First Aid', 'tax': 'reduced',
         'quantity': 195, 'unit': 'Packs', 'min_stock': 50, 'max_stock': 400, 'unit_cost': Decimal('3.50'), 
         'selling_price': Decimal('7.49'), 'supplier': suppliers[1], 'location': locations[10],
         'image_url': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200&h=200&fit=crop'},
        
        {'sku': 'FA-002', 'name': 'Sterile Gauze Pads 4x4 (Pack of 25)', 'category': 'First Aid', 'tax': 'reduced',
         'quantity': 145, 'unit': 'Packs', 'min_stock': 35, 'max_stock': 300, 'unit_cost': Decimal('4.20'), 
         'selling_price': Decimal('8.99'), 'supplier': suppliers[1], 'location': locations[10],
         'image_url': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200&h=200&fit=crop'},
        
        {'sku': 'FA-003', 'name': 'Medical Tape 2.5cm x 5m', 'category': 'First Aid', 'tax': 'reduced',
         'quantity': 125, 'unit': 'Rolls', 'min_stock': 30, 'max_stock': 250, 'unit_cost': Decimal('2.80'), 
         'selling_price': Decimal('5.99'), 'supplier': suppliers[0], 'location': locations[11],
         'image_url': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200&h=200&fit=crop'},
        
        {'sku': 'FA-004', 'name': 'Antiseptic Solution 250ml', 'category': 'First Aid', 'tax': 'reduced',
         'quantity': 88, 'unit': 'Bottles', 'min_stock': 20, 'max_stock': 180, 'unit_cost': Decimal('5.40'), 
         'selling_price': Decimal('11.49'), 'supplier': suppliers[1], 'location': locations[11],
         'image_url': 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=200&h=200&fit=crop'},
        
        {'sku': 'FA-005', 'name': 'Elastic Bandage 7.5cm x 4.5m', 'category': 'First Aid', 'tax': 'reduced',
         'quantity': 72, 'unit': 'Rolls', 'min_stock': 18, 'max_stock': 150, 'unit_cost': Decimal('3.90'), 
         'selling_price': Decimal('8.49'), 'supplier': suppliers[0], 'location': locations[11],
         'image_url': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200&h=200&fit=crop'},
        
        {'sku': 'FA-006', 'name': 'First Aid Kit Complete', 'category': 'First Aid', 'tax': 'reduced',
         'quantity': 45, 'unit': 'Kits', 'min_stock': 10, 'max_stock': 100, 'unit_cost': Decimal('18.50'), 
         'selling_price': Decimal('39.99'), 'supplier': suppliers[1], 'location': locations[14],
         'image_url': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200&h=200&fit=crop'},
        
        # Medical Devices
        {'sku': 'MD-001', 'name': 'Digital Thermometer', 'category': 'Medical Devices', 'tax': 'standard',
         'quantity': 68, 'unit': 'Units', 'min_stock': 15, 'max_stock': 150, 'unit_cost': Decimal('8.90'), 
         'selling_price': Decimal('17.99'), 'supplier': suppliers[5], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=200&fit=crop'},
        
        {'sku': 'MD-002', 'name': 'Blood Pressure Monitor', 'category': 'Medical Devices', 'tax': 'standard',
         'quantity': 32, 'unit': 'Units', 'min_stock': 8, 'max_stock': 80, 'unit_cost': Decimal('28.50'), 
         'selling_price': Decimal('59.99'), 'supplier': suppliers[5], 'location': locations[14],
         'image_url': 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=200&h=200&fit=crop'},
        
        {'sku': 'MD-003', 'name': 'Pulse Oximeter', 'category': 'Medical Devices', 'tax': 'standard',
         'quantity': 48, 'unit': 'Units', 'min_stock': 12, 'max_stock': 100, 'unit_cost': Decimal('18.90'), 
         'selling_price': Decimal('39.99'), 'supplier': suppliers[5], 'location': locations[14],
         'image_url': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=200&fit=crop'},
        
        {'sku': 'MD-004', 'name': 'Glucose Meter Kit', 'category': 'Medical Devices', 'tax': 'exempt',
         'quantity': 55, 'unit': 'Kits', 'min_stock': 12, 'max_stock': 120, 'unit_cost': Decimal('22.50'), 
         'selling_price': Decimal('45.99'), 'supplier': suppliers[5], 'location': locations[13],
         'image_url': 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=200&h=200&fit=crop'},
        
        {'sku': 'MD-005', 'name': 'Nebulizer Machine', 'category': 'Medical Devices', 'tax': 'exempt',
         'quantity': 18, 'unit': 'Units', 'min_stock': 5, 'max_stock': 50, 'unit_cost': Decimal('48.00'), 
         'selling_price': Decimal('99.99'), 'supplier': suppliers[5], 'location': locations[14],
         'image_url': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=200&fit=crop'},
        
        # Baby Care
        {'sku': 'BC-001', 'name': 'Baby Diapers Size 3 (Pack of 36)', 'category': 'Baby Care', 'tax': 'reduced',
         'quantity': 125, 'unit': 'Packs', 'min_stock': 30, 'max_stock': 250, 'unit_cost': Decimal('9.80'), 
         'selling_price': Decimal('19.99'), 'supplier': suppliers[3], 'location': locations[14],
         'image_url': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop'},
        
        {'sku': 'BC-002', 'name': 'Baby Wipes (Pack of 80)', 'category': 'Baby Care', 'tax': 'reduced',
         'quantity': 185, 'unit': 'Packs', 'min_stock': 45, 'max_stock': 400, 'unit_cost': Decimal('3.20'), 
         'selling_price': Decimal('6.99'), 'supplier': suppliers[3], 'location': locations[8],
         'image_url': 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=200&h=200&fit=crop'},
        
        {'sku': 'BC-003', 'name': 'Baby Lotion 300ml', 'category': 'Baby Care', 'tax': 'reduced',
         'quantity': 95, 'unit': 'Bottles', 'min_stock': 25, 'max_stock': 200, 'unit_cost': Decimal('5.60'), 
         'selling_price': Decimal('11.99'), 'supplier': suppliers[2], 'location': locations[8],
         'image_url': 'https://images.unsplash.com/photo-1585155770960-d5e41c5c7f00?w=200&h=200&fit=crop'},
        
        {'sku': 'BC-004', 'name': 'Baby Shampoo 400ml', 'category': 'Baby Care', 'tax': 'reduced',
         'quantity': 108, 'unit': 'Bottles', 'min_stock': 28, 'max_stock': 220, 'unit_cost': Decimal('4.80'), 
         'selling_price': Decimal('9.99'), 'supplier': suppliers[2], 'location': locations[8],
         'image_url': 'https://images.unsplash.com/photo-1585155770960-d5e41c5c7f00?w=200&h=200&fit=crop'},
        
        {'sku': 'BC-005', 'name': 'Baby Powder 200g', 'category': 'Baby Care', 'tax': 'reduced',
         'quantity': 82, 'unit': 'Bottles', 'min_stock': 20, 'max_stock': 180, 'unit_cost': Decimal('4.20'), 
         'selling_price': Decimal('8.99'), 'supplier': suppliers[2], 'location': locations[9],
         'image_url': 'https://images.unsplash.com/photo-1585155770960-d5e41c5c7f00?w=200&h=200&fit=crop'},
        
        # Skincare
        {'sku': 'SK-001', 'name': 'Moisturizing Cream 100ml', 'category': 'Skincare', 'tax': 'luxury',
         'quantity': 75, 'unit': 'Tubes', 'min_stock': 18, 'max_stock': 160, 'unit_cost': Decimal('8.40'), 
         'selling_price': Decimal('17.99'), 'supplier': suppliers[4], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop'},
        
        {'sku': 'SK-002', 'name': 'Sunscreen SPF 50+ 150ml', 'category': 'Skincare', 'tax': 'standard',
         'quantity': 118, 'unit': 'Bottles', 'min_stock': 30, 'max_stock': 250, 'unit_cost': Decimal('9.80'), 
         'selling_price': Decimal('19.99'), 'supplier': suppliers[4], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop'},
        
        {'sku': 'SK-003', 'name': 'Anti-Aging Serum 30ml', 'category': 'Skincare', 'tax': 'luxury',
         'quantity': 42, 'unit': 'Bottles', 'min_stock': 10, 'max_stock': 100, 'unit_cost': Decimal('18.50'), 
         'selling_price': Decimal('39.99'), 'supplier': suppliers[4], 'location': locations[14],
         'image_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop'},
        
        {'sku': 'SK-004', 'name': 'Lip Balm SPF 15', 'category': 'Skincare', 'tax': 'standard',
         'quantity': 165, 'unit': 'Sticks', 'min_stock': 40, 'max_stock': 350, 'unit_cost': Decimal('1.80'), 
         'selling_price': Decimal('3.99'), 'supplier': suppliers[3], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop'},
        
        {'sku': 'SK-005', 'name': 'Facial Cleanser 200ml', 'category': 'Skincare', 'tax': 'standard',
         'quantity': 92, 'unit': 'Bottles', 'min_stock': 23, 'max_stock': 200, 'unit_cost': Decimal('6.90'), 
         'selling_price': Decimal('14.99'), 'supplier': suppliers[4], 'location': locations[8],
         'image_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop'},
        
        # Dental Care
        {'sku': 'DC-001', 'name': 'Toothpaste Fluoride 100ml', 'category': 'Dental Care', 'tax': 'standard',
         'quantity': 225, 'unit': 'Tubes', 'min_stock': 55, 'max_stock': 450, 'unit_cost': Decimal('2.40'), 
         'selling_price': Decimal('4.99'), 'supplier': suppliers[2], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop'},
        
        {'sku': 'DC-002', 'name': 'Toothbrush Soft Bristle', 'category': 'Dental Care', 'tax': 'standard',
         'quantity': 195, 'unit': 'Units', 'min_stock': 48, 'max_stock': 400, 'unit_cost': Decimal('1.60'), 
         'selling_price': Decimal('3.49'), 'supplier': suppliers[2], 'location': locations[15],
         'image_url': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop'},
        
        {'sku': 'DC-003', 'name': 'Mouthwash 500ml', 'category': 'Dental Care', 'tax': 'standard',
         'quantity': 135, 'unit': 'Bottles', 'min_stock': 33, 'max_stock': 280, 'unit_cost': Decimal('4.50'), 
         'selling_price': Decimal('9.49'), 'supplier': suppliers[2], 'location': locations[8],
         'image_url': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop'},
        
        {'sku': 'DC-004', 'name': 'Dental Floss 50m', 'category': 'Dental Care', 'tax': 'standard',
         'quantity': 158, 'unit': 'Units', 'min_stock': 38, 'max_stock': 320, 'unit_cost': Decimal('2.20'), 
         'selling_price': Decimal('4.49'), 'supplier': suppliers[2], 'location': locations[9],
         'image_url': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop'},
        
        {'sku': 'DC-005', 'name': 'Teeth Whitening Strips (14 Day)', 'category': 'Dental Care', 'tax': 'luxury',
         'quantity': 52, 'unit': 'Boxes', 'min_stock': 12, 'max_stock': 120, 'unit_cost': Decimal('14.80'), 
         'selling_price': Decimal('29.99'), 'supplier': suppliers[4], 'location': locations[14],
         'image_url': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop'},
        
        # Eye Care
        {'sku': 'EC-001', 'name': 'Eye Drops Lubricating 15ml', 'category': 'Eye Care', 'tax': 'reduced',
         'quantity': 105, 'unit': 'Bottles', 'min_stock': 25, 'max_stock': 220, 'unit_cost': Decimal('5.80'), 
         'selling_price': Decimal('11.99'), 'supplier': suppliers[1], 'location': locations[13],
         'image_url': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=200&fit=crop'},
        
        {'sku': 'EC-002', 'name': 'Contact Lens Solution 360ml', 'category': 'Eye Care', 'tax': 'standard',
         'quantity': 88, 'unit': 'Bottles', 'min_stock': 22, 'max_stock': 180, 'unit_cost': Decimal('6.90'), 
         'selling_price': Decimal('14.49'), 'supplier': suppliers[4], 'location': locations[13],
         'image_url': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=200&fit=crop'},
        
        {'sku': 'EC-003', 'name': 'Reading Glasses +2.00', 'category': 'Eye Care', 'tax': 'standard',
         'quantity': 35, 'unit': 'Units', 'min_stock': 8, 'max_stock': 80, 'unit_cost': Decimal('8.50'), 
         'selling_price': Decimal('17.99'), 'supplier': suppliers[5], 'location': locations[14],
         'image_url': 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200&h=200&fit=crop'},
        
        {'sku': 'EC-004', 'name': 'Eye Mask Cooling Gel', 'category': 'Eye Care', 'tax': 'standard',
         'quantity': 62, 'unit': 'Units', 'min_stock': 15, 'max_stock': 130, 'unit_cost': Decimal('4.90'), 
         'selling_price': Decimal('9.99'), 'supplier': suppliers[3], 'location': locations[13],
         'image_url': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=200&fit=crop'},
    ]
    
    # Add random last_restocked dates for realism
    base_date = datetime.now()
    
    for item_data in items_data:
        # Random restock date within last 60 days
        days_ago = random.randint(1, 60)
        last_restocked = base_date - timedelta(days=days_ago)
        
        # Generate barcode
        barcode = f"{random.randint(100000000000, 999999999999)}"
        
        InventoryItem.objects.get_or_create(
            sku=item_data['sku'],
            defaults={
                'name': item_data['name'],
                'category': categories[item_data['category']],
                'tax': taxes[item_data['tax']],
                'quantity': item_data['quantity'],
                'unit': item_data['unit'],
                'min_stock': item_data['min_stock'],
                'max_stock': item_data['max_stock'],
                'unit_cost': item_data['unit_cost'],
                'selling_price': item_data['selling_price'],
                'image_url': item_data['image_url'],
                'supplier': item_data['supplier'],
                'location': item_data['location'],
                'barcode': barcode,
                'last_restocked': last_restocked
            }
        )
    
    print(f"✓ Created {len(items_data)} inventory items")
    
    print("\n" + "="*50)
    print("✓ Database seeding completed successfully!")
    print("="*50)
    print(f"\nSummary:")
    print(f"  - Taxes: {Tax.objects.count()}")
    print(f"  - Categories: {Category.objects.count()}")
    print(f"  - Staff Accounts: {Account.objects.count()}")
    print(f"  - Customers: {Customer.objects.count()}")
    print(f"  - Inventory Items: {InventoryItem.objects.count()}")
    print("\nDefault login credentials:")
    print("  Username: admin (or any staff username)")
    print("  Password: password123")
    print("="*50)

if __name__ == '__main__':
    seed()
