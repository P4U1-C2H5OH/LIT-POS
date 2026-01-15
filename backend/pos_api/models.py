from django.db import models
from django.contrib.auth.models import AbstractUser

class Account(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('CASHIER', 'Cashier'),
        ('MANAGER', 'Manager'),
    ]
    name = models.CharField(max_length=255)
    profile_picture = models.URLField(max_length=500, null=True, blank=True)
    last_access = models.DateTimeField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CASHIER')

    def __str__(self):
        return f"{self.name} ({self.role})"

class Tax(models.Model):
    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=5, decimal_places=2) # e.g. 0.15 for 15%

    def __str__(self):
        return f"{self.name} ({self.rate * 100}%)"

class Category(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    tax = models.ForeignKey(Tax, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=50) # Tablets, Bottles, etc.
    min_stock = models.IntegerField(default=10)
    max_stock = models.IntegerField(default=100)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    supplier = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    barcode = models.CharField(max_length=255, null=True, blank=True)
    last_restocked = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"

class Customer(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    group = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    avatar = models.TextField(null=True, blank=True)
    customer_since = models.DateField(auto_now_add=True)
    last_visit = models.DateTimeField(null=True, blank=True)  # Last transaction date
    total_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    purchase_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    PAYMENT_METHODS = [
        ('M-PESA', 'M-Pesa'),
        ('ECOCASH', 'EcoCash'),
        ('CASH', 'Cash'),
        ('CREDIT', 'Credit'),
        ('EFT', 'EFT'),
    ]
    STATUS_CHOICES = [
        ('COMPLETED', 'Completed'),
        ('REFUNDED', 'Refunded'),
        ('PENDING', 'Pending'),
    ]
    transaction_number = models.CharField(max_length=100, unique=True)
    date = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='transactions')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2)
    tax = models.DecimalField(max_digits=15, decimal_places=2)
    discount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')

    def __str__(self):
        return self.transaction_number

class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    price_at_sale = models.DecimalField(max_digits=10, decimal_places=2)

class SavedCart(models.Model):
    cart_number = models.CharField(max_length=100, unique=True)
    saved_date = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=15, decimal_places=2)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.cart_number

class SavedCartItem(models.Model):
    cart = models.ForeignKey(SavedCart, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.IntegerField()

class StockAdjustment(models.Model):
    ADJUSTMENT_TYPES = [
        ('ADDITION', 'Addition'),
        ('REMOVAL', 'Removal'),
        ('DAMAGE', 'Damage'),
        ('TRANSFER', 'Transfer'),
        ('RETURN', 'Return'),
        ('DISPOSAL', 'Disposal'),
    ]
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='adjustments')
    type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPES)
    quantity = models.IntegerField()
    previous_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    reason = models.CharField(max_length=255)
    adjusted_by = models.ForeignKey(Account, on_delete=models.PROTECT)
    adjusted_date = models.DateTimeField(auto_now_add=True)
