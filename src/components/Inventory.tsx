import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  FileText,
  Clock,
  User,
  Printer,
  ScanLine,
  ChevronDown,
  X,
  Check,
  Calendar,
  DollarSign,
  Layers,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Archive,
  PieChart,
  Activity,
} from "lucide-react";
import logo from "figma:asset/9a588303adbb1fdb50d30917cd5d81adce6d930a.png";
import { api, Item as InventoryItem, StockAdjustment, DashboardMetrics, Category, Tax } from "../api";
import { useEffect } from "react";

interface InventoryProps {
  userName: string;
  userProfilePicture: string;
  userRole: string;
}

// interfaces removed, using api.ts

type ViewMode = "Items" | "Adjustments" | "Reports";
type ItemFilter = "All" | "In Stock" | "Low Stock" | "Out of Stock";
type ReportView = "Overview" | "COGS" | "Projected" | "Category";

export function Inventory({ userName, userProfilePicture, userRole }: InventoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemFilter, setItemFilter] = useState<ItemFilter>("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    stock: 0,
    min_stock: 10,
    max_stock: 100,
    unit_cost: '0.00',
    price: 0,
    supplier: '',
    location: '',
    barcode: '',
    tax: '',
    image: null as File | null
  });
  const [adjustment, setAdjustment] = useState({
    type: 'ADDITION',
    quantity: 0,
    reason: '',
    notes: ''
  });
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [adjustmentFilter, setAdjustmentFilter] = useState("All");
  const [adjustmentTimeFrame, setAdjustmentTimeFrame] = useState("All Time");
  const [adjustmentStaffFilter, setAdjustmentStaffFilter] = useState("All");
  const [reportView, setReportView] = useState<ReportView>("Overview");

  // What-if analysis states
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [stockAdjustment, setStockAdjustment] = useState(0);

  // COGS report states
  const [cogsSortBy, setCogsSortBy] = useState<'revenue' | 'volume' | 'margin' | 'cogs'>('revenue');
  const [showAllCOGS, setShowAllCOGS] = useState(false);

  // Price adjustment states
  const [editingPrice, setEditingPrice] = useState(false);
  const [newSellingPrice, setNewSellingPrice] = useState("");
  const [priceChangeReason, setPriceChangeReason] = useState("");

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [allStockAdjustments, setAllStockAdjustments] = useState<StockAdjustment[]>([]);
  const [globalStats, setGlobalStats] = useState<DashboardMetrics | null>(null);
  const [backendCategories, setBackendCategories] = useState<Category[]>([]);
  const [backendTaxes, setBackendTaxes] = useState<Tax[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Items, Categories, Taxes (Should be accessible to all authorized users)
      try {
        const [items, cats, txs] = await Promise.all([
          api.getInventory(),
          api.getCategories(),
          api.getTaxes()
        ]);
        setInventoryItems(items);
        setBackendCategories(cats);
        setBackendTaxes(txs);
      } catch (error) {
        console.error("Failed to fetch basic inventory data:", error);
      }

      // 2. Fetch Dashboard Metrics (Restricted to Admin/Manager)
      try {
        const stats = await api.getDashboardMetrics();
        setGlobalStats(stats);
      } catch (error) {
        // Silently fail for non-admin users
        console.log("Could not fetch dashboard metrics (likely restricted)");
      }

      // 3. Fetch Stock Adjustments (Restricted to Admin/Manager)
      try {
        const adjustments = await api.getStockAdjustments();
        setAllStockAdjustments(adjustments);
      } catch (error) {
        // Silently fail for non-admin users
        console.log("Could not fetch stock adjustments (likely restricted)");
      }
    };
    fetchData();
  }, []);

  // Adjustments handled by API

  const categories = [
    "All",
    ...backendCategories.map((c: Category) => c.name),
  ];

  const staffMembers = [
    "All",
    ...Array.from(new Set(allStockAdjustments.map((adj: StockAdjustment) => adj.adjustedBy))),
  ];

  // Filter items
  const getFilteredItems = () => {
    let filtered = inventoryItems;

    // Filter by status
    if (itemFilter !== "All") {
      filtered = filtered.filter((item: InventoryItem) => {
        const qty = item.stock;
        const min = item.min_stock || 10;
        if (itemFilter === "In Stock") return qty > min;
        if (itemFilter === "Low Stock") return qty > 0 && qty <= min;
        if (itemFilter === "Out of Stock") return qty === 0;
        return true;
      });
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item: InventoryItem) => item.categoryName === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item: InventoryItem) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Filter adjustments (FIXED)
  const getFilteredAdjustments = () => {
    let filtered = allStockAdjustments;

    // Filter by time period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (adjustmentTimeFrame) {
      case "Today":
        filtered = filtered.filter((adj: StockAdjustment) => new Date(adj.adjustedDate) >= today);
        break;
      case "Last 7 Days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter((adj: StockAdjustment) => new Date(adj.adjustedDate) >= sevenDaysAgo);
        break;
      case "Last 30 Days":
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter((adj: StockAdjustment) => new Date(adj.adjustedDate) >= thirtyDaysAgo);
        break;
    }

    // Filter by adjustment type
    if (adjustmentFilter !== "All") {
      filtered = filtered.filter((adj: StockAdjustment) => adj.type === adjustmentFilter);
    }

    // Filter by staff member
    if (adjustmentStaffFilter !== "All") {
      filtered = filtered.filter((adj: StockAdjustment) => adj.adjustedBy === adjustmentStaffFilter);
    }

    return filtered.sort((a: StockAdjustment, b: StockAdjustment) => new Date(b.adjustedDate).getTime() - new Date(a.adjustedDate).getTime());
  };

  const filteredItems = getFilteredItems();
  const filteredAdjustments = getFilteredAdjustments();

  // Check if any filters are active
  const hasActiveFilters =
    adjustmentTimeFrame !== "All Time" ||
    adjustmentFilter !== "All" ||
    adjustmentStaffFilter !== "All";

  const clearAllFilters = () => {
    setAdjustmentTimeFrame("All Time");
    setAdjustmentFilter("All");
    setAdjustmentStaffFilter("All");
  };

  const handleAddItem = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('sku', newItem.sku);
      formData.append('category', newItem.category || (backendCategories.length > 0 ? backendCategories[0].id.toString() : '1'));
      formData.append('tax', newItem.tax || (backendTaxes.length > 0 ? backendTaxes[0].id.toString() : '1'));
      formData.append('unit', newItem.unit);
      formData.append('stock', newItem.stock.toString());
      formData.append('min_stock', newItem.min_stock.toString());
      formData.append('max_stock', newItem.max_stock.toString());
      formData.append('unit_cost', newItem.unit_cost);
      formData.append('price', newItem.price.toString());
      formData.append('supplier', newItem.supplier);
      formData.append('location', newItem.location);
      formData.append('barcode', newItem.barcode);

      if (newItem.image) {
        formData.append('image', newItem.image);
      }

      await api.createInventoryItem(formData);
      alert("Item added successfully!");
      setShowAddItemModal(false);
      setNewItem({
        name: '',
        sku: '',
        category: '',
        unit: '',
        stock: 0,
        min_stock: 10,
        max_stock: 100,
        unit_cost: '0.00',
        price: 0,
        supplier: '',
        location: '',
        barcode: '',
        tax: '',
        image: null
      });
      // Refresh inventory
      const [items, stats] = await Promise.all([
        api.getInventory(),
        api.getDashboardMetrics()
      ]);
      setInventoryItems(items);
      setGlobalStats(stats);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item. Please check the details.");
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedItem) return;
    try {
      const newPrice = parseFloat(newSellingPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        alert("Please enter a valid price");
        return;
      }

      await api.updateInventoryItem(selectedItem.id, {
        price: newPrice,
        reason: priceChangeReason
      });

      alert(`Price updated successfully to M${newPrice.toFixed(2)}`);

      setSelectedItem({ ...selectedItem, price: newPrice });
      setEditingPrice(false);
      setNewSellingPrice("");
      setPriceChangeReason("");

      const [items, stats] = await Promise.all([
        api.getInventory(),
        api.getDashboardMetrics()
      ]);
      setInventoryItems(items);
      setGlobalStats(stats);
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price.");
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        item: selectedItem.id,
        ...adjustment
      };

      await api.adjustStock(payload);
      alert("Stock adjusted successfully!");
      setShowAdjustStockModal(false);
      setSelectedItem(null);
      setAdjustment({
        type: 'ADDITION',
        quantity: 0,
        reason: '',
        notes: ''
      });
      // Refresh data
      const [items, stats, adjustments] = await Promise.all([
        api.getInventory(),
        api.getDashboardMetrics(),
        api.getStockAdjustments()
      ]);
      setInventoryItems(items);
      setGlobalStats(stats);
      setAllStockAdjustments(adjustments);
    } catch (error) {
      console.error("Error adjusting stock:", error);
      alert("Failed to adjust stock.");
    }
  };

  // Calculate stats
  const calculateStats = () => {
    const totalItems = inventoryItems.length;
    const totalValue = globalStats?.inventory?.current_value_at_cost || 0;
    const lowStockItems = globalStats?.inventory?.low_stock_count || 0;
    const outOfStockItems = inventoryItems.filter(
      (item: InventoryItem) => item.stock === 0
    ).length;

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
    };
  };

  const getItemStatus = (item: InventoryItem) => {
    const qty = item.stock;
    const min = item.min_stock || 10;
    if (qty === 0) return "Out of Stock";
    if (qty <= min) return "Low Stock";
    return "In Stock";
  };

  const stats = calculateStats();

  // Calculate FIFO COGS
  const calculateFIFOCOGS = () => {
    const totalRevenue = globalStats?.summary?.total_sales || 0;
    const grossProfit = globalStats?.summary?.gross_profit || 0;
    const totalCOGS = totalRevenue - grossProfit;
    const margin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;

    // Derive simulated sold items from inventory items if needed, 
    // or keep a subset for UI demonstration until a full sales API is ready.
    const soldItems = inventoryItems.map(item => ({
      itemId: item.id,
      name: item.name,
      quantity: Math.floor(Math.random() * 20) + 1,
      costAtPurchase: Number(item.unit_cost) || 0,
      soldPrice: item.price
    }));

    return {
      totalCOGS,
      totalRevenue,
      grossProfit,
      margin,
      soldItems,
    };
  };

  // Calculate projected profit
  const calculateProjectedProfit = (priceAdj = 0, stockAdj = 0) => {
    // Base calculations from globalStats
    const currentInventoryValue = globalStats?.inventory?.current_value_at_cost || 0;
    const projectedRevenue = globalStats?.inventory?.potential_revenue || 0;
    const projectedProfit = projectedRevenue - currentInventoryValue;
    const projectedMargin = projectedRevenue > 0 ? ((projectedProfit / projectedRevenue) * 100) : 0;

    // Calculate adjusted values based on inventory items
    let adjustedRevenue = 0;
    let adjustedCost = 0;

    inventoryItems.forEach((item) => {
      const adjustedStock = item.stock * (1 + stockAdj / 100);
      const adjustedPrice = item.price * (1 + priceAdj / 100);
      const itemCost = (Number(item.unit_cost) || 0) * (1 + stockAdj / 100);

      adjustedRevenue += adjustedStock * adjustedPrice;
      adjustedCost += item.stock * itemCost;
    });

    const adjustedProfit = adjustedRevenue - adjustedCost;
    const adjustedMargin = adjustedRevenue > 0 ? ((adjustedProfit / adjustedRevenue) * 100) : 0;

    return {
      currentInventoryValue,
      projectedRevenue,
      projectedProfit,
      projectedMargin,
      adjustedRevenue,
      adjustedProfit,
      adjustedMargin,
    };
  };

  // Calculate category breakdown
  const calculateCategoryBreakdown = () => {
    const breakdown = categories.filter(c => c !== "All").map((category) => {
      const categoryItems = inventoryItems.filter((item) => item.categoryName === category);
      const stockValue = categoryItems.reduce((sum: number, item: InventoryItem) => sum + item.stock * (Number(item.unit_cost) || 0), 0);
      const projectedValue = categoryItems.reduce((sum: number, item: InventoryItem) => sum + item.stock * item.price, 0);
      const profit = projectedValue - stockValue;
      const margin = projectedValue > 0 ? ((profit / projectedValue) * 100) : 0;
      const totalQuantity = categoryItems.reduce((sum: number, item: InventoryItem) => sum + item.stock, 0);

      return {
        category,
        itemCount: categoryItems.length,
        stockValue,
        projectedValue,
        profit,
        margin,
        totalQuantity,
      };
    });

    return breakdown.sort((a, b) => b.profit - a.profit);
  };

  const formatDate = (date: Date | string) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAdjustmentStyle = (type: string) => {
    const styles: Record<string, { icon: any; color: string; bg: string }> = {
      Addition: {
        icon: ArrowUpCircle,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      Removal: {
        icon: ArrowDownCircle,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      Damage: {
        icon: AlertTriangle,
        color: "text-red-600",
        bg: "bg-red-100",
      },
      Transfer: {
        icon: RefreshCw,
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
      Return: {
        icon: Package,
        color: "text-orange-600",
        bg: "bg-orange-100",
      },
      Disposal: {
        icon: Archive,
        color: "text-slate-600",
        bg: "bg-slate-100",
      },
    };
    return (
      styles[type] || {
        icon: Package,
        color: "text-slate-600",
        bg: "bg-slate-100",
      }
    );
  };

  const cogsData = calculateFIFOCOGS();
  const projectedData = calculateProjectedProfit(priceAdjustment, stockAdjustment);
  const categoryData = calculateCategoryBreakdown();

  return (
    <div className="flex-1 bg-[#ffffff] p-8 relative overflow-y-auto h-screen">
      {/* Background Logo */}
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-contain opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${logo})` }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-slate-900 mb-1">Inventory Management</h1>
            <p className="text-slate-500 text-sm">
              Manage your stock levels and inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors w-64"
              />
            </div>

            {/* Add Item Button */}
            <button
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center gap-2 bg-[#D78B30] hover:bg-[#C4661F] text-white rounded-xl px-4 py-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Item</span>
            </button>

            {/* Bulk Upload */}
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="flex items-center gap-2 bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-xl px-4 py-2 hover:border-[#D78B30] transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">Bulk Upload</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Items */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">📦 Total Items</span>
            </div>
            <div className="text-3xl text-slate-900 mb-1">
              {stats.totalItems}
            </div>
            <p className="text-xs text-blue-700">Unique SKUs</p>
          </div>

          {/* Inventory Value */}
          <div className="bg-gradient-to-br from-green-100 to-green-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">💰 Total Value</span>
            </div>
            <div className="text-3xl text-slate-900 mb-1">
              M{stats.totalValue.toFixed(2)}
            </div>
            <p className="text-xs text-green-700">At cost price</p>
          </div>

          {/* Low Stock */}
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-700">⚠️ Low Stock</span>
            </div>
            <div className="text-3xl text-slate-900 mb-1">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-orange-700">Items need restock</p>
          </div>

          {/* Out of Stock */}
          <div className="bg-gradient-to-br from-red-100 to-red-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-700">🚫 Out of Stock</span>
            </div>
            <div className="text-3xl text-slate-900 mb-1">
              {stats.outOfStockItems}
            </div>
            <p className="text-xs text-red-700">Items unavailable</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-2 shadow-sm border-2 border-white/50 mb-6 flex gap-2 w-fit">
          <button
            onClick={() => setViewMode("Items")}
            className={`px-6 py-2.5 rounded-xl text-sm transition-all ${viewMode === "Items"
              ? "bg-[#D78B30] text-white shadow-sm"
              : "text-slate-600 hover:bg-white/50"
              }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Items</span>
            </div>
          </button>
          {userRole !== 'CASHIER' && (
            <>
              <button
                onClick={() => setViewMode("Adjustments")}
                className={`px-6 py-2.5 rounded-xl text-sm transition-all ${viewMode === "Adjustments"
                  ? "bg-[#D78B30] text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Adjustments</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode("Reports")}
                className={`px-6 py-2.5 rounded-xl text-sm transition-all ${viewMode === "Reports"
                  ? "bg-[#D78B30] text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Conditionally render based on view mode */}
        {viewMode === "Items" && (
          <>
            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Status:</span>
                  <div className="flex items-center gap-2 bg-white/50 rounded-lg p-1">
                    {(["All", "In Stock", "Low Stock", "Out of Stock"] as ItemFilter[]).map(
                      (filter) => (
                        <button
                          key={filter}
                          onClick={() => setItemFilter(filter)}
                          className={`px-3 py-1.5 rounded-md text-sm transition-all ${itemFilter === filter
                            ? "bg-[#D78B30] text-white shadow-sm"
                            : "text-slate-600 hover:bg-white/50"
                            }`}
                        >
                          {filter}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/50 border-2 border-white/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ml-auto text-sm text-slate-500">
                  Showing {filteredItems.length} item
                  {filteredItems.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border-2 border-white/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50">
                    <tr>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Item
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        SKU
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Category
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Quantity
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Status
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Value
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Package className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-slate-400 text-sm">
                              No items found
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                              Try adjusting your filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const status = getItemStatus(item);
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-white/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-slate-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {item.location}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                {item.sku}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                {item.categoryName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-slate-900">
                                  {item.stock} {item.unit}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Min: {item.min_stock}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${status === "In Stock"
                                  ? "bg-green-100 text-green-700"
                                  : status === "Low Stock"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                M{(item.stock * (Number(item.unit_cost) || 0)).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setShowItemDetails(true);
                                  }}
                                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4 text-slate-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setShowAdjustStockModal(true);
                                  }}
                                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                  title="Adjust Stock"
                                >
                                  <Edit className="w-4 h-4 text-slate-600" />
                                </button>
                                <button
                                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                  title="Print Barcode"
                                >
                                  <Printer className="w-4 h-4 text-slate-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {viewMode === "Adjustments" && (
          <>
            {/* Adjustment Filters */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Time Frame */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Period:</span>
                  <select
                    value={adjustmentTimeFrame}
                    onChange={(e) => setAdjustmentTimeFrame(e.target.value)}
                    className="bg-white/50 border-2 border-white/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  >
                    <option value="All Time">All Time</option>
                    <option value="Today">Today</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                  </select>
                </div>

                {/* Adjustment Type */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Type:</span>
                  <select
                    value={adjustmentFilter}
                    onChange={(e) => setAdjustmentFilter(e.target.value)}
                    className="bg-white/50 border-2 border-white/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  >
                    <option value="All">All Types</option>
                    <option value="ADDITION">Addition</option>
                    <option value="REMOVAL">Removal</option>
                    <option value="DAMAGE">Damage</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="RETURN">Return</option>
                    <option value="DISPOSAL">Disposal</option>
                  </select>
                </div>

                {/* Staff Member Filter */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Staff:</span>
                  <select
                    value={adjustmentStaffFilter}
                    onChange={(e) => setAdjustmentStaffFilter(e.target.value)}
                    className="bg-white/50 border-2 border-white/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  >
                    {staffMembers.map((staff) => (
                      <option key={staff} value={staff}>
                        {staff}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 rounded-lg px-3 py-1.5 hover:bg-red-200 transition-colors text-sm"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear Filters</span>
                    </button>
                  )}
                  <button className="flex items-center gap-2 bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-xl px-4 py-2 hover:border-[#D78B30] transition-colors">
                    <Download className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Export</span>
                  </button>
                </div>
              </div>

              {/* Active Filters Badges */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">Active filters:</span>
                  {adjustmentTimeFrame !== "All Time" && (
                    <span className="inline-flex items-center gap-1 bg-[#D78B30]/20 border border-[#D78B30] text-[#D78B30] text-xs px-2 py-1 rounded-lg">
                      <Calendar className="w-3 h-3" />
                      {adjustmentTimeFrame}
                      <button
                        onClick={() => setAdjustmentTimeFrame("All Time")}
                        className="hover:bg-[#D78B30]/30 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {adjustmentFilter !== "All" && (
                    <span className="inline-flex items-center gap-1 bg-[#D78B30]/20 border border-[#D78B30] text-[#D78B30] text-xs px-2 py-1 rounded-lg">
                      <Filter className="w-3 h-3" />
                      {adjustmentFilter}
                      <button
                        onClick={() => setAdjustmentFilter("All")}
                        className="hover:bg-[#D78B30]/30 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {adjustmentStaffFilter !== "All" && (
                    <span className="inline-flex items-center gap-1 bg-[#D78B30]/20 border border-[#D78B30] text-[#D78B30] text-xs px-2 py-1 rounded-lg">
                      <User className="w-3 h-3" />
                      {adjustmentStaffFilter}
                      <button
                        onClick={() => setAdjustmentStaffFilter("All")}
                        className="hover:bg-[#D78B30]/30 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                Showing {filteredAdjustments.length} adjustment{filteredAdjustments.length !== 1 ? "s" : ""}
                {hasActiveFilters && " (filtered)"}
              </p>
            </div>

            {/* Adjustments Table */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border-2 border-white/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50">
                    <tr>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Date & Time
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Item
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Type
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Change
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Reason
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Adjusted By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdjustments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Layers className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-slate-400 text-sm">
                              No adjustments found
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                              {hasActiveFilters ? "Try adjusting your filters" : "No stock adjustments yet"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAdjustments.map((adjustment) => {
                        const adjustmentStyle = getAdjustmentStyle(
                          adjustment.type
                        );
                        const AdjustmentIcon = adjustmentStyle.icon;

                        return (
                          <tr
                            key={adjustment.id}
                            className="hover:bg-white/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-slate-900">
                                  {formatDate(new Date(adjustment.adjustedDate))}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatTime(new Date(adjustment.adjustedDate))}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-slate-900">
                                  {adjustment.itemName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {adjustment.itemSku}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className={`flex items-center gap-2 ${adjustmentStyle.bg} ${adjustmentStyle.color} px-3 py-1.5 rounded-lg w-fit`}
                              >
                                <AdjustmentIcon className="w-3 h-3" />
                                <span className="text-xs">
                                  {adjustment.type}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p
                                  className={`text-sm ${adjustment.type === "ADDITION"
                                    ? "text-green-600"
                                    : "text-red-600"
                                    }`}
                                >
                                  {adjustment.type === "ADDITION" ? "+" : "-"}
                                  {adjustment.quantity}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {adjustment.previousQuantity} →{" "}
                                  {adjustment.newQuantity}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                {adjustment.reason}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                {adjustment.adjustedBy}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {viewMode === "Reports" && (
          <div className="space-y-6">
            {/* Report Sub-navigation */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-2 shadow-sm border-2 border-white/50 flex gap-2 w-fit">
              <button
                onClick={() => setReportView("Overview")}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${reportView === "Overview"
                  ? "bg-[#D78B30] text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/50"
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setReportView("COGS")}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${reportView === "COGS"
                  ? "bg-[#D78B30] text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/50"
                  }`}
              >
                COGS (FIFO)
              </button>
              <button
                onClick={() => setReportView("Projected")}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${reportView === "Projected"
                  ? "bg-[#D78B30] text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/50"
                  }`}
              >
                Projected Profit
              </button>
              <button
                onClick={() => setReportView("Category")}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${reportView === "Category"
                  ? "bg-[#D78B30] text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/50"
                  }`}
              >
                By Category
              </button>
            </div>

            {/* Overview Report */}
            {reportView === "Overview" && (
              <>
                {/* Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* COGS */}
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-slate-900">Cost of Goods Sold</h3>
                      <DollarSign className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-3xl text-slate-900 mb-2">
                      M{cogsData.totalCOGS.toFixed(2)}
                    </div>
                    <p className="text-sm text-slate-500">FIFO Method</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Live data</span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-slate-900">Revenue</h3>
                      <TrendingUp className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-3xl text-slate-900 mb-2">
                      M{cogsData.totalRevenue.toFixed(2)}
                    </div>
                    <p className="text-sm text-slate-500">From sold items</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Live data</span>
                    </div>
                  </div>

                  {/* Profit Margin */}
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-slate-900">Profit Margin</h3>
                      <BarChart3 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-3xl text-slate-900 mb-2">
                      {cogsData.margin.toFixed(1)}%
                    </div>
                    <p className="text-sm text-slate-500">Average margin</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Live data</span>
                    </div>
                  </div>
                </div>

                {/* Top Performing Items */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-900">Top Performing Items</h3>
                    <button className="flex items-center gap-2 text-sm text-[#D78B30] hover:text-[#C4661F] transition-colors">
                      View All
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {globalStats?.top_items.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white/50 rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-[#D78B30]/20 rounded-full flex items-center justify-center">
                              <span className="text-sm text-[#D78B30]">
                                #{index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.sku}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              M{item.revenue.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {item.quantity} {item.unit} sold
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
                  <h3 className="text-slate-900 mb-4">Export Reports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-[#D78B30] text-slate-700 px-4 py-3 rounded-xl transition-colors">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Export as PDF</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-[#D78B30] text-slate-700 px-4 py-3 rounded-xl transition-colors">
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Export as Excel</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-[#D78B30] text-slate-700 px-4 py-3 rounded-xl transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Email Report</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* COGS Report (FIFO) */}
            {reportView === "COGS" && (
              <div className="space-y-6">
                {/* COGS Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-2xl p-6 border-2 border-white/50">
                    <p className="text-sm text-red-700 mb-2">Total COGS</p>
                    <p className="text-3xl text-slate-900 mb-1">
                      M{cogsData.totalCOGS.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-700">FIFO Method</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 border-2 border-white/50">
                    <p className="text-sm text-green-700 mb-2">Revenue</p>
                    <p className="text-3xl text-slate-900 mb-1">
                      M{cogsData.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-700">From sales</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border-2 border-white/50">
                    <p className="text-sm text-blue-700 mb-2">Gross Profit</p>
                    <p className="text-3xl text-slate-900 mb-1">
                      M{cogsData.grossProfit.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-700">Total profit</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border-2 border-white/50">
                    <p className="text-sm text-purple-700 mb-2">Margin</p>
                    <p className="text-3xl text-slate-900 mb-1">
                      {cogsData.margin.toFixed(1)}%
                    </p>
                    <p className="text-xs text-purple-700">Average margin</p>
                  </div>
                </div>

                {/* FIFO Explanation */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-900 font-medium mb-2">
                        FIFO Methodology Applied
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        This report uses First-In, First-Out (FIFO) accounting to calculate the cost of goods sold. Items purchased first are assumed to be sold first, providing accurate cost tracking.
                      </p>
                      <p className="text-xs text-blue-600">
                        Note: COGS automatically updates when you adjust unit costs, mark items as damaged, or process stock changes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sold Items Breakdown */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border-2 border-white/50 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-slate-900">Sold Items Breakdown (FIFO)</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Items sold with their purchase cost and revenue
                        </p>
                      </div>
                      {/* Sort Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Sort by:</span>
                        <select
                          value={cogsSortBy}
                          onChange={(e) => setCogsSortBy(e.target.value as any)}
                          className="bg-white/50 border-2 border-white/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                        >
                          <option value="revenue">Revenue (Highest)</option>
                          <option value="volume">Volume (Most Sold)</option>
                          <option value="margin">Profit Margin (%)</option>
                          <option value="cogs">Total COGS</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/50">
                        <tr>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Item
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Qty Sold
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Unit Cost (FIFO)
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Total COGS
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Revenue
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Profit
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          // Sort items based on selected criteria
                          const sortedItems = [...cogsData.soldItems].sort((a, b) => {
                            switch (cogsSortBy) {
                              case 'revenue':
                                return (b.quantity * b.soldPrice) - (a.quantity * a.soldPrice);
                              case 'volume':
                                return b.quantity - a.quantity;
                              case 'margin': {
                                const marginA = a.soldPrice > 0 ? ((a.soldPrice - a.costAtPurchase) / a.soldPrice) * 100 : 0;
                                const marginB = b.soldPrice > 0 ? ((b.soldPrice - b.costAtPurchase) / b.soldPrice) * 100 : 0;
                                return marginB - marginA;
                              }
                              case 'cogs':
                                return (b.quantity * b.costAtPurchase) - (a.quantity * a.costAtPurchase);
                              default:
                                return 0;
                            }
                          });

                          // Slice based on showAllCOGS state
                          const displayedItems = showAllCOGS ? sortedItems : sortedItems.slice(0, 15);

                          return displayedItems.map((soldItem, index) => {
                            const item = inventoryItems.find(i => i.id === soldItem.itemId);
                            const totalCost = soldItem.quantity * soldItem.costAtPurchase;
                            const totalRevenue = soldItem.quantity * soldItem.soldPrice;
                            const profit = totalRevenue - totalCost;
                            const margin = ((profit / totalRevenue) * 100);

                            return (
                              <tr key={index} className="hover:bg-white/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="text-sm text-slate-900">
                                      {item?.name || "Unknown Item"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {item?.sku}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-slate-900">
                                    {soldItem.quantity}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-slate-900">
                                    M{soldItem.costAtPurchase.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-red-600">
                                    M{totalCost.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-green-600">
                                    M{totalRevenue.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-blue-600">
                                    M{profit.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-sm ${margin >= 50 ? "text-green-600" :
                                    margin >= 30 ? "text-blue-600" :
                                      "text-orange-600"
                                    }`}>
                                    {margin.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Show More Button */}
                  {cogsData.soldItems.length > 15 && (
                    <div className="p-4 border-t border-slate-200 flex justify-center">
                      <button
                        onClick={() => setShowAllCOGS(!showAllCOGS)}
                        className="flex items-center gap-2 bg-white/70 hover:bg-white border-2 border-white/50 hover:border-[#D78B30] text-slate-700 px-6 py-2 rounded-xl transition-colors text-sm"
                      >
                        {showAllCOGS ? (
                          <>
                            <ChevronDown className="w-4 h-4 rotate-180" />
                            <span>Show Less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Show More ({cogsData.soldItems.length - 15} more items)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Projected Profit Report */}
            {reportView === "Projected" && (
              <div className="space-y-6">
                {/* Projected Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-6 border-2 border-white/50">
                    <p className="text-sm text-yellow-700 mb-2">Current Value</p>
                    <p className="text-3xl text-slate-900 mb-1">
                      M{projectedData.currentInventoryValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-yellow-700">At cost price</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 border-2 border-white/50">
                    <p className="text-sm text-green-700 mb-2">Projected Revenue</p>
                    <p className="text-3xl text-slate-900 mb-1">
                      M{projectedData.projectedRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-700">If all sold</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border-2 border-white/50">
                    <p className="text-sm text-blue-700 mb-2">Projected Profit</p>
                    <p className="text-3xl text-slate-900 mb-1">
                      M{projectedData.projectedProfit.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-700">Potential gain</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border-2 border-white/50">
                    <p className="text-sm text-purple-700 mb-2">Avg Margin</p>
                    <p className="text-3xl text-slate-900 mb-1">
                      {projectedData.projectedMargin.toFixed(1)}%
                    </p>
                    <p className="text-xs text-purple-700">Across inventory</p>
                  </div>
                </div>

                {/* What-If Scenario Tool */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
                  <h3 className="text-slate-900 mb-4">What-If Analysis</h3>
                  <p className="text-sm text-slate-600 mb-6">
                    Adjust parameters to see how changes impact your projected profit
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-slate-700 block mb-2">
                        Average Price Increase: <span className="font-semibold text-[#D78B30]">{priceAdjustment > 0 ? '+' : ''}{priceAdjustment}%</span>
                      </label>
                      <input
                        type="range"
                        min="-20"
                        max="50"
                        value={priceAdjustment}
                        onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-20%</span>
                        <span className="text-[#D78B30]">0%</span>
                        <span>+50%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 block mb-2">
                        Stock Level Adjustment: <span className="font-semibold text-[#D78B30]">{stockAdjustment > 0 ? '+' : ''}{stockAdjustment}%</span>
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="100"
                        value={stockAdjustment}
                        onChange={(e) => setStockAdjustment(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-50%</span>
                        <span className="text-[#D78B30]">0%</span>
                        <span>+100%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    {/* Base Projection */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-900">
                        Base Projected Profit: <span className="font-bold">M{projectedData.projectedProfit.toFixed(2)}</span>
                      </p>
                    </div>

                    {/* Adjusted Projection */}
                    {(priceAdjustment !== 0 || stockAdjustment !== 0) && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-green-900">
                            Adjusted Projected Profit: <span className="font-bold">M{projectedData.adjustedProfit.toFixed(2)}</span>
                          </p>
                          <button
                            onClick={() => {
                              setPriceAdjustment(0);
                              setStockAdjustment(0);
                            }}
                            className="text-xs text-green-700 hover:text-green-900 underline"
                          >
                            Reset
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`font-semibold ${projectedData.adjustedProfit - projectedData.projectedProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {projectedData.adjustedProfit - projectedData.projectedProfit >= 0 ? '+' : ''}
                            M{(projectedData.adjustedProfit - projectedData.projectedProfit).toFixed(2)}
                          </span>
                          <span className="text-green-700">
                            ({((projectedData.adjustedProfit - projectedData.projectedProfit) / projectedData.projectedProfit * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-green-700">
                          Revenue: M{projectedData.adjustedRevenue.toFixed(2)} | Margin: {projectedData.adjustedMargin.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item-by-Item Projection */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border-2 border-white/50 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-slate-900">Item-by-Item Projection</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Potential profit from current inventory
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/50">
                        <tr>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Item
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Quantity
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Cost Value
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Selling Value
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Profit Potential
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventoryItems.map((item) => {
                          const costValue = item.stock * (Number(item.unit_cost) || 0);
                          const sellingValue = item.stock * item.price;
                          const profit = sellingValue - costValue;
                          const margin = sellingValue > 0 ? ((profit / sellingValue) * 100) : 0;

                          return (
                            <tr key={item.id} className="hover:bg-white/30 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {item.sku}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-slate-900">
                                  {item.stock} {item.unit}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-orange-600">
                                  M{costValue.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-green-600">
                                  M{sellingValue.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-blue-600">
                                  M{profit.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-sm ${margin >= 70 ? "text-green-600" :
                                  margin >= 50 ? "text-blue-600" :
                                    margin >= 30 ? "text-orange-600" :
                                      "text-red-600"
                                  }`}>
                                  {margin.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Category Report */}
            {reportView === "Category" && (
              <div className="space-y-6">
                {/* Category Summary */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-slate-900">Category Performance</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Breakdown by inventory category
                      </p>
                    </div>
                    <PieChart className="w-6 h-6 text-slate-400" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryData.map((cat, index) => {
                      const colors = [
                        { bg: "from-blue-100 to-blue-200", text: "text-blue-700" },
                        { bg: "from-green-100 to-green-200", text: "text-green-700" },
                        { bg: "from-purple-100 to-purple-200", text: "text-purple-700" },
                        { bg: "from-orange-100 to-orange-200", text: "text-orange-700" },
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <div
                          key={cat.category}
                          className={`bg-gradient-to-br ${color.bg} rounded-xl p-4 border-2 border-white/50`}
                        >
                          <p className={`text-sm ${color.text} mb-2`}>
                            {cat.category}
                          </p>
                          <p className="text-2xl text-slate-900 mb-1">
                            M{cat.profit.toFixed(2)}
                          </p>
                          <p className={`text-xs ${color.text}`}>
                            {cat.margin.toFixed(1)}% margin
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Category Table */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border-2 border-white/50 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-slate-900">Detailed Category Analysis</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Sort by any column to analyze performance
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/50">
                        <tr>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Category
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Items
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Total Qty
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Stock Value
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Projected Value
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Profit
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {categoryData.map((cat) => (
                          <tr key={cat.category} className="hover:bg-white/30 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-slate-900">
                                {cat.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                {cat.itemCount} items
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                {cat.totalQuantity}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-orange-600">
                                M{cat.stockValue.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-green-600">
                                M{cat.projectedValue.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-blue-600 font-medium">
                                M{cat.profit.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${cat.margin >= 70 ? "text-green-600" :
                                  cat.margin >= 50 ? "text-blue-600" :
                                    cat.margin >= 30 ? "text-orange-600" :
                                      "text-red-600"
                                  }`}>
                                  {cat.margin.toFixed(1)}%
                                </span>
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${cat.margin >= 70 ? "bg-green-500" :
                                      cat.margin >= 50 ? "bg-blue-500" :
                                        cat.margin >= 30 ? "bg-orange-500" :
                                          "bg-red-500"
                                      }`}
                                    style={{ width: `${Math.min(cat.margin, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock by Category Alert */}
                {stats.lowStockItems > 0 && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-orange-900 font-medium mb-2">
                          Low Stock Alert
                        </h4>
                        <p className="text-sm text-orange-700">
                          {stats.lowStockItems} items across categories are running low. Consider restocking to maintain optimal inventory levels.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-3xl w-full border-2 border-white/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-900 text-xl mb-1">
                  Add New Item
                </h3>
                <p className="text-sm text-slate-500">
                  Enter item details or scan barcode
                </p>
              </div>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Barcode Scanner */}
              <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-slate-700">
                    Scan Barcode
                  </label>
                  <ScanLine className="w-5 h-5 text-[#D78B30]" />
                </div>
                <input
                  type="text"
                  placeholder="Click to scan or enter barcode manually"
                  value={newItem.barcode}
                  onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                  className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                />
              </div>

              {/* Image Upload */}
              <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-slate-700">
                    Item Image
                  </label>
                  <Upload className="w-5 h-5 text-[#D78B30]" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewItem({ ...newItem, image: e.target.files[0] });
                    }
                  }}
                  className="w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#D78B30]/10 file:text-[#D78B30]
                    hover:file:bg-[#D78B30]/20
                  "
                />
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Item Name */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., MED-001"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Category *
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  >
                    <option value="">Select Category</option>
                    {backendCategories.map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tax */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Tax Rate *
                  </label>
                  <select
                    value={newItem.tax}
                    onChange={(e) => setNewItem({ ...newItem, tax: e.target.value })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  >
                    <option value="">Select Tax</option>
                    {backendTaxes.map((tax: Tax) => (
                      <option key={tax.id} value={tax.id}>
                        {tax.name} ({tax.rate}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Unit *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tablets, Bottles, Units"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* Initial Quantity */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Initial Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* Min Stock */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newItem.min_stock}
                    onChange={(e) => setNewItem({ ...newItem, min_stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* Max Stock */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Max Stock Level
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newItem.max_stock}
                    onChange={(e) => setNewItem({ ...newItem, max_stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* Unit Cost */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Unit Cost (M)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.unit_cost}
                    onChange={(e) => setNewItem({ ...newItem, unit_cost: e.target.value })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Selling Price (M) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="Supplier name"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm text-slate-700 block mb-2">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Shelf A1"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="flex-1 bg-[#D78B30] hover:bg-[#C4661F] text-white px-4 py-3 rounded-xl transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full border-2 border-white/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-900 text-xl mb-1">
                  Adjust Stock
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedItem.name} ({selectedItem.sku})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAdjustStockModal(false);
                  setSelectedItem(null);
                  setEditingPrice(false);
                }}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Stock */}
              <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                <p className="text-xs text-slate-500 mb-2">Current Stock</p>
                <p className="text-2xl text-slate-900">
                  {selectedItem.stock} {selectedItem.unit}
                </p>
              </div>

              {/* Current Selling Price with Edit Option */}
              <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">Selling Price</p>
                  <button
                    onClick={() => {
                      setEditingPrice(!editingPrice);
                      setNewSellingPrice(selectedItem.price.toString());
                    }}
                    className="text-xs text-[#D78B30] hover:text-[#C4661F] transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    {editingPrice ? "Cancel" : "Edit Price"}
                  </button>
                </div>
                {editingPrice ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      step="0.01"
                      value={newSellingPrice}
                      onChange={(e) => setNewSellingPrice(e.target.value)}
                      placeholder="New selling price"
                      className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                    />
                    <input
                      type="text"
                      value={priceChangeReason}
                      onChange={(e) => setPriceChangeReason(e.target.value)}
                      placeholder="Reason for price change (optional)"
                      className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                    />
                    <button
                      onClick={handleUpdatePrice}
                      className="w-full bg-[#D78B30] hover:bg-[#C4661F] text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Confirm Price Change
                    </button>
                  </div>
                ) : (
                  <p className="text-2xl text-slate-900">
                    M{Number(selectedItem.price).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Adjustment Type */}
              <div>
                <label className="text-sm text-slate-700 block mb-2">
                  Adjustment Type *
                </label>
                <select
                  value={adjustment.type}
                  onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value as any })}
                  className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                >
                  <option value="ADDITION">Addition (Receive Stock)</option>
                  <option value="REMOVAL">Removal (Sales/Usage)</option>
                  <option value="DAMAGE">Damage/Spoilage</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="RETURN">Return to Supplier</option>
                  <option value="DISPOSAL">Disposal</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm text-slate-700 block mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm text-slate-700 block mb-2">
                  Reason *
                </label>
                <input
                  type="text"
                  placeholder="e.g., New stock received, Sold, Damaged"
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                  className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm text-slate-700 block mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Add any additional details..."
                  value={adjustment.notes}
                  onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
                  className="w-full bg-white/50 border-2 border-white/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAdjustStockModal(false);
                    setSelectedItem(null);
                    setEditingPrice(false);
                  }}
                  className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustStock}
                  className="flex-1 bg-[#D78B30] hover:bg-[#C4661F] text-white px-4 py-3 rounded-xl transition-colors"
                >
                  Confirm Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full border-2 border-white/50 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-900 text-xl mb-1">
                  Bulk Upload Items
                </h3>
                <p className="text-sm text-slate-500">
                  Upload a CSV file to add multiple items
                </p>
              </div>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-[#D78B30] transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-900 mb-2">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-sm text-slate-500">
                  Supports .csv, .xlsx files up to 10MB
                </p>
              </div>

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 mb-1">
                      Need a template?
                    </p>
                    <p className="text-xs text-blue-700 mb-3">
                      Download our CSV template with the correct format
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700 underline">
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkUploadModal(false)}
                  className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("File uploaded successfully!");
                    setShowBulkUploadModal(false);
                  }}
                  className="flex-1 bg-[#D78B30] hover:bg-[#C4661F] text-white px-4 py-3 rounded-xl transition-colors"
                >
                  Upload & Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {showItemDetails && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-3xl w-full border-2 border-white/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-900 text-xl mb-1">
                  Item Details
                </h3>
                <p className="text-sm text-slate-500">
                  Complete information for {selectedItem.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowItemDetails(false);
                  setSelectedItem(null);
                }}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Banner */}
              {(() => {
                const itemStatus = getItemStatus(selectedItem);
                return (
                  <div
                    className={`rounded-xl p-4 ${itemStatus === "In Stock"
                      ? "bg-green-100 border border-green-200"
                      : itemStatus === "Low Stock"
                        ? "bg-orange-100 border border-orange-200"
                        : "bg-red-100 border border-red-200"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${itemStatus === "In Stock"
                            ? "text-green-900"
                            : itemStatus === "Low Stock"
                              ? "text-orange-900"
                              : "text-red-900"
                            }`}
                        >
                          Status: {itemStatus}
                        </p>
                        <p
                          className={`text-xs mt-1 ${itemStatus === "In Stock"
                            ? "text-green-700"
                            : itemStatus === "Low Stock"
                              ? "text-orange-700"
                              : "text-red-700"
                            }`}
                        >
                          {itemStatus === "Low Stock" &&
                            `Below minimum stock level of ${selectedItem.min_stock}`}
                          {itemStatus === "Out of Stock" &&
                            "Immediate restocking required"}
                        </p>
                      </div>
                      <span
                        className={`text-2xl ${itemStatus === "In Stock"
                          ? "text-green-600"
                          : itemStatus === "Low Stock"
                            ? "text-orange-600"
                            : "text-red-600"
                          }`}
                      >
                        {itemStatus === "In Stock"
                          ? "✓"
                          : itemStatus === "Low Stock"
                            ? "⚠️"
                            : "✕"}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                  <p className="text-xs text-slate-500 mb-2">SKU</p>
                  <p className="text-sm text-slate-900">{selectedItem.sku}</p>
                </div>

                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                  <p className="text-xs text-slate-500 mb-2">Category</p>
                  <p className="text-sm text-slate-900">
                    {selectedItem.category}
                  </p>
                </div>

                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                  <p className="text-xs text-slate-500 mb-2">
                    Current Stock
                  </p>
                  <p className="text-sm text-slate-900">
                    {selectedItem.stock} {selectedItem.unit}
                  </p>
                </div>

                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                  <p className="text-xs text-slate-500 mb-2">Stock Range</p>
                  <p className="text-sm text-slate-900">
                    {selectedItem.min_stock} - {selectedItem.max_stock}{" "}
                    {selectedItem.unit}
                  </p>
                </div>

                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                  <p className="text-xs text-slate-500 mb-2">Unit Cost</p>
                  <p className="text-sm text-slate-900">
                    M{(Number(selectedItem.unit_cost) || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500">Selling Price</p>
                    <button
                      onClick={() => {
                        setEditingPrice(true);
                        setNewSellingPrice(selectedItem.price.toString());
                        setShowItemDetails(false);
                        setShowAdjustStockModal(true);
                      }}
                      className="text-xs text-[#D78B30] hover:text-[#C4661F] transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-900">
                    M{Number(selectedItem.price).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                  <p className="text-xs text-slate-500 mb-2">Supplier</p>
                  <p className="text-sm text-slate-900">
                    {selectedItem.supplier}
                  </p>
                </div>

                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                  <p className="text-xs text-slate-500 mb-2">Location</p>
                  <p className="text-sm text-slate-900">
                    {selectedItem.location}
                  </p>
                </div>

                {selectedItem.barcode && (
                  <div className="col-span-2 bg-white/50 rounded-xl p-4 border border-white/50">
                    <p className="text-xs text-slate-500 mb-2">Barcode</p>
                    <p className="text-sm text-slate-900 font-mono">
                      {selectedItem.barcode}
                    </p>
                  </div>
                )}

                <div className="col-span-2 bg-white/50 rounded-xl p-4 border border-white/50">
                  <p className="text-xs text-slate-500 mb-2">
                    Last Restocked
                  </p>
                  <p className="text-sm text-slate-900">
                    {selectedItem.last_restocked ? formatDate(new Date(selectedItem.last_restocked)) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-900 mb-3">
                  Financial Summary
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-green-700 mb-1">Total Value</p>
                    <p className="text-lg text-green-900">
                      M
                      {(selectedItem.stock * (Number(selectedItem.unit_cost) || 0)).toFixed(
                        2
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 mb-1">
                      Potential Revenue
                    </p>
                    <p className="text-lg text-green-900">
                      M
                      {(
                        selectedItem.stock * selectedItem.price
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 mb-1">
                      Profit Margin
                    </p>
                    <p className="text-lg text-green-900">
                      {(
                        ((selectedItem.price - (Number(selectedItem.unit_cost) || 0)) /
                          selectedItem.price) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowItemDetails(false);
                    setShowAdjustStockModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#D78B30] hover:bg-[#C4661F] text-white px-4 py-3 rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Adjust Stock</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-[#D78B30] text-slate-700 px-4 py-3 rounded-xl transition-colors">
                  <Printer className="w-4 h-4" />
                  <span>Print Barcode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
