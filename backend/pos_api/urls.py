from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountViewSet, TaxViewSet, CategoryViewSet, InventoryItemViewSet, 
    CustomerViewSet, TransactionViewSet, SavedCartViewSet, StockAdjustmentViewSet,
    DashboardMetricsView, MyTokenObtainPairView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'taxes', TaxViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'inventory', InventoryItemViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'saved-carts', SavedCartViewSet, basename='saved-cart')
router.register(r'stock-adjustments', StockAdjustmentViewSet)
router.register(r'dashboard', DashboardMetricsView, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
