from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Account, Tax, Category, InventoryItem, Customer, Transaction, TransactionItem, SavedCart, SavedCartItem, StockAdjustment
from django.db.models import Sum

class AccountSerializer(serializers.ModelSerializer):
    profilePicture = serializers.URLField(source='profile_picture')
    lastAccess = serializers.DateTimeField(source='last_access')
    dailyStats = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'username', 'name', 'profilePicture', 'lastAccess', 'role', 'dailyStats']

    def get_dailyStats(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        txns = obj.transactions.filter(date__date=today, status='COMPLETED')
        total_sales = txns.aggregate(total=Sum('total'))['total'] or 0
        transactions_count = txns.count()
        items_sold = TransactionItem.objects.filter(transaction__in=txns).aggregate(total=Sum('quantity'))['total'] or 0
        
        return {
            "totalSales": total_sales,
            "transactions": transactions_count,
            "itemsSold": items_sold
        }

class TaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    categoryName = serializers.ReadOnlyField(source='category.name')
    taxRate = serializers.ReadOnlyField(source='tax.rate')
    price = serializers.DecimalField(source='selling_price', max_digits=10, decimal_places=2)
    stock = serializers.IntegerField(source='quantity')
    image = serializers.URLField(source='image_url')

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'sku', 'name', 'price', 'stock', 'category', 'categoryName', 
            'tax', 'taxRate', 'unit', 'image', 'min_stock', 'max_stock', 'unit_cost',
            'supplier', 'location', 'barcode', 'last_restocked'
        ]

class CustomerSerializer(serializers.ModelSerializer):
    customerSince = serializers.DateField(source='customer_since', read_only=True)
    lastVisit = serializers.DateTimeField(source='last_visit', read_only=True)
    avgSpend = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'email', 'phone', 'group', 'notes', 'avatar', 
            'customerSince', 'lastVisit', 'avgSpend', 'total_spent', 'purchase_count'
        ]

    def get_avgSpend(self, obj):
        if obj.purchase_count > 0:
            return obj.total_spent / obj.purchase_count
        return 0

class TransactionItemSerializer(serializers.ModelSerializer):
    itemName = serializers.ReadOnlyField(source='item.name')
    
    class Meta:
        model = TransactionItem
        fields = ['id', 'item', 'itemName', 'quantity', 'price_at_sale']

class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, read_only=True)
    customerName = serializers.ReadOnlyField(source='customer.name')
    customerAvatar = serializers.ReadOnlyField(source='customer.avatar')
    accountName = serializers.ReadOnlyField(source='account.name')
    transactionNumber = serializers.CharField(source='transaction_number', required=False)
    paymentMethod = serializers.CharField(source='payment_method')

    class Meta:
        model = Transaction
        fields = [
            'id', 'transactionNumber', 'date', 'customer', 'customerName', 'customerAvatar', 
            'account', 'accountName', 'paymentMethod', 'subtotal', 'tax', 
            'discount', 'total', 'status', 'items'
        ]
        extra_kwargs = {
            'account': {'required': False},  # Set by view from request.user
            'transactionNumber': {'required': False},  # Auto-generated in view
        }

class SavedCartItemSerializer(serializers.ModelSerializer):
    itemName = serializers.ReadOnlyField(source='item.name')

    class Meta:
        model = SavedCartItem
        fields = ['id', 'item', 'itemName', 'quantity']

class SavedCartSerializer(serializers.ModelSerializer):
    items = SavedCartItemSerializer(many=True, read_only=True)
    customerName = serializers.ReadOnlyField(source='customer.name')
    customerAvatar = serializers.ReadOnlyField(source='customer.avatar')
    accountName = serializers.ReadOnlyField(source='account.name')
    cartNumber = serializers.CharField(source='cart_number', required=False)
    savedDate = serializers.DateTimeField(source='saved_date', read_only=True)

    class Meta:
        model = SavedCart
        fields = [
            'id', 'cartNumber', 'savedDate', 'customer', 'customerName', 'customerAvatar', 
            'account', 'accountName', 'subtotal', 'tax', 'discount', 'total', 
            'notes', 'items'
        ]
        extra_kwargs = {
            'account': {'required': False},  # Set by view from request.user
            'cartNumber': {'required': False},  # Auto-generated in view
        }

class StockAdjustmentSerializer(serializers.ModelSerializer):
    itemName = serializers.ReadOnlyField(source='item.name')
    adjustedByName = serializers.ReadOnlyField(source='adjusted_by.name')
    adjustedDate = serializers.DateTimeField(source='adjusted_date', read_only=True)
    previousQuantity = serializers.IntegerField(source='previous_quantity', read_only=True)
    newQuantity = serializers.IntegerField(source='new_quantity', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = [
            'id', 'item', 'itemName', 'type', 'quantity', 'previousQuantity', 
            'newQuantity', 'reason', 'adjusted_by', 'adjustedByName', 'adjustedDate'
        ]

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = AccountSerializer(self.user).data
        return data
