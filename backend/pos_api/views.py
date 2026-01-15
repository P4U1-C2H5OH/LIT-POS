from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction as db_transaction, models
from django.db.models import Sum, Count, F
from django.utils import timezone
from .models import Account, Tax, Category, InventoryItem, Customer, Transaction, TransactionItem, SavedCart, SavedCartItem, StockAdjustment
from .serializers import (
    AccountSerializer, TaxSerializer, CategorySerializer, InventoryItemSerializer, 
    CustomerSerializer, TransactionSerializer, SavedCartSerializer, StockAdjustmentSerializer,
    MyTokenObtainPairSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAdmin, IsManager, IsCashier, IsAdminOrManager, IsAdminOrManagerOrReadOnly

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAdminOrManager] # Restricted to Admin/Manager

class TaxViewSet(viewsets.ModelViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]

from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock_items = self.queryset.filter(quantity__lte=F('min_stock'))
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(account=self.request.user).order_by('-date')

    @db_transaction.atomic
    def create(self, request, *args, **kwargs):
        items_data = request.data.pop('items', [])
        
        # Generate unique transaction number if not provided or empty
        if not request.data.get('transactionNumber'):
            from django.utils import timezone
            import random
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            random_suffix = random.randint(1000, 9999)
            request.data['transactionNumber'] = f"TXN-{timestamp}-{random_suffix}"
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the transaction
        txn = serializer.save(account=request.user)
        
        total_items_sold = 0
        for item_data in items_data:
            inventory_item = InventoryItem.objects.select_for_update().get(id=item_data['item'])
            qty = item_data['quantity']
            
            # Check stock
            if inventory_item.quantity < qty:
                return Response({"error": f"Insufficient stock for {inventory_item.name}"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create TransactionItem
            TransactionItem.objects.create(
                transaction=txn,
                item=inventory_item,
                quantity=qty,
                price_at_sale=item_data.get('price_at_sale', inventory_item.selling_price)
            )
            
            # Update stock
            inventory_item.quantity -= qty
            inventory_item.save()
            total_items_sold += qty

        # Update customer stats if customer is linked
        if txn.customer:
            from django.utils import timezone
            txn.customer.total_spent += txn.total
            txn.customer.purchase_count += 1
            txn.customer.last_visit = timezone.now()  # Update last visit timestamp
            txn.customer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SavedCartViewSet(viewsets.ModelViewSet):
    serializer_class = SavedCartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedCart.objects.filter(account=self.request.user).order_by('-saved_date')

    @db_transaction.atomic
    def create(self, request, *args, **kwargs):
        items_data = request.data.pop('items', [])
        
        # Generate unique cart number if not provided or empty
        if not request.data.get('cartNumber'):
            from django.utils import timezone
            import random
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            random_suffix = random.randint(1000, 9999)
            request.data['cartNumber'] = f"CART-{timestamp}-{random_suffix}"
        
        # Calculate total from items if not provided
        if 'total' not in request.data or not request.data.get('total'):
            total = 0
            for item_data in items_data:
                inventory_item = InventoryItem.objects.get(id=item_data['item'])
                total += inventory_item.selling_price * item_data['quantity']
            request.data['total'] = total
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the saved cart
        cart = serializer.save(account=request.user)
        
        # Create SavedCartItems
        for item_data in items_data:
            SavedCartItem.objects.create(
                cart=cart,
                item_id=item_data['item'],
                quantity=item_data['quantity']
            )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StockAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.all().order_by('-adjusted_date')
    serializer_class = StockAdjustmentSerializer
    permission_classes = [IsAdminOrManager]

    @db_transaction.atomic
    def perform_create(self, serializer):
        item = serializer.validated_data['item']
        adj_type = serializer.validated_data['type']
        qty = serializer.validated_data['quantity']
        
        prev_qty = item.quantity
        new_qty = prev_qty
        
        if adj_type in ['ADDITION', 'RETURN']:
            new_qty += qty
        else: # REMOVAL, DAMAGE, TRANSFER, DISPOSAL
            new_qty -= qty
            
        serializer.save(
            previous_quantity=prev_qty,
            new_quantity=new_qty,
            adjusted_by=self.request.user
        )
        
        item.quantity = new_qty
        item.save()

class DashboardMetricsView(viewsets.ViewSet):
    permission_classes = [IsAdminOrManager]
    
    def list(self, request):
        today = timezone.now().date()
        
        # Revenue and sales count for today
        today_txn = Transaction.objects.filter(date__date=today, status='COMPLETED')
        today_revenue = today_txn.aggregate(total=Sum('total'))['total'] or 0
        today_count = today_txn.count()
        
        # Inventory value (at cost)
        inventory_value = InventoryItem.objects.aggregate(
            total=Sum(F('quantity') * F('unit_cost'), output_field=models.DecimalField())
        )['total'] or 0
        
        # Inventory value (at selling price - potential revenue)
        potential_revenue = InventoryItem.objects.aggregate(
            total=Sum(F('quantity') * F('selling_price'), output_field=models.DecimalField())
        )['total'] or 0
        
        # Low stock count
        low_stock_count = InventoryItem.objects.filter(quantity__lte=F('min_stock')).count()
        
        # User-specific contribution for today
        user_txn = today_txn.filter(account=request.user)
        user_revenue = user_txn.aggregate(total=Sum('total'))['total'] or 0
        user_count = user_txn.count()
        user_items_sold = TransactionItem.objects.filter(transaction__in=user_txn).aggregate(total=Sum('quantity'))['total'] or 0

        # Summary (Overall)
        all_completed_txn = Transaction.objects.filter(status='COMPLETED')
        total_sales = all_completed_txn.aggregate(total=Sum('total'))['total'] or 0
        total_customers = Customer.objects.count()
        total_transactions = all_completed_txn.count()
        
        # Gross profit calculation
        # This is a bit simplified: Sum(price_at_sale - unit_cost)
        gross_profit = TransactionItem.objects.filter(transaction__status='COMPLETED').aggregate(
            profit=Sum((F('price_at_sale') - F('item__unit_cost')) * F('quantity'), output_field=models.DecimalField())
        )['profit'] or 0

        # Top performing items
        top_items_data = TransactionItem.objects.filter(transaction__status='COMPLETED').values(
            'item__name', 'item__sku', 'item__unit'
        ).annotate(
            total_quantity=Sum('quantity'),
            revenue=Sum(F('price_at_sale') * F('quantity'), output_field=models.DecimalField())
        ).order_by('-total_quantity')[:5]

        top_items = []
        for item in top_items_data:
            top_items.append({
                "name": item['item__name'],
                "sku": item['item__sku'],
                "unit": item['item__unit'],
                "quantity": item['total_quantity'],
                "revenue": float(item['revenue'])
            })

        return Response({
            "today": {
                "revenue": float(today_revenue),
                "transactions": today_count
            },
            "myContribution": {
                "revenue": float(user_revenue),
                "transactions": user_count,
                "itemsSold": user_items_sold
            },
            "inventory": {
                "current_value_at_cost": float(inventory_value),
                "potential_revenue": float(potential_revenue),
                "low_stock_count": low_stock_count
            },
            "summary": {
                "total_sales": float(total_sales),
                "total_customers": total_customers,
                "total_transactions": total_transactions,
                "gross_profit": float(gross_profit)
            },
            "top_items": top_items
        })

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
