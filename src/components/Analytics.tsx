import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Layers,
  Box,
  Archive,
  RefreshCw,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  FileText,
  Eye,
  ArrowRight,
} from "lucide-react";
import logo from "figma:asset/9a588303adbb1fdb50d30917cd5d81adce6d930a.png";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface AnalyticsProps {
  userName: string;
  userProfilePicture: string;
}

type ViewSection =
  | "Overview"
  | "Trending"
  | "Alerts"
  | "Categories"
  | "Insights";
type TimePeriod = "Today" | "Week" | "Month" | "Quarter" | "Year" | "Custom";
type AlertType = "Stock" | "Expiration" | "Overstock";

interface CategoryPerformance {
  id: string;
  name: string;
  salesVolume: number;
  revenue: number;
  profit: number;
  margin: number;
  turnoverRate: number;
  stockValue: number;
  itemCount: number;
  trend: "up" | "down" | "stable";
}

interface TrendingItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  margin: number;
  stockLevel: number;
  trend: "up" | "down";
  velocity: number; // items per day
}

interface StockAlert {
  id: string;
  itemName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  type: "low" | "out" | "overstock";
  daysUntilOut?: number;
  suggestedAction: string;
}

interface ExpirationAlert {
  id: string;
  itemName: string;
  sku: string;
  category: string;
  quantity: number;
  expirationDate: Date;
  daysUntilExpiration: number;
  value: number;
  severity: "critical" | "warning" | "info";
}

export function Analytics({ userName, userProfilePicture }: AnalyticsProps) {
  const [viewSection, setViewSection] = useState<ViewSection>("Overview");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Month");
  const [alertFilter, setAlertFilter] = useState<AlertType>("Stock");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showExportModal, setShowExportModal] = useState(false);

  // Mock data for Overview KPIs
  const overviewKPIs = {
    totalSales: 145678.5,
    revenue: 198456.75,
    grossProfit: 52778.25,
    profitMargin: 26.6,
    cogs: 92900.25,
    inventoryValue: 234567.89,
    projectedProfit: 62341.56,
    salesGrowth: 12.5,
    revenueGrowth: 15.3,
    transactionCount: 1247,
  };

  // Mock trending items data
  const topSellingItems: TrendingItem[] = [
    {
      id: "1",
      name: "Premium Titanium Barbell",
      sku: "PTB-001",
      category: "Piercings",
      quantitySold: 156,
      revenue: 4680.0,
      profit: 1872.0,
      margin: 40,
      stockLevel: 45,
      trend: "up",
      velocity: 5.2,
    },
    {
      id: "2",
      name: "Healing Balm - Premium",
      sku: "HBP-003",
      category: "Aftercare",
      quantitySold: 143,
      revenue: 2145.0,
      profit: 965.25,
      margin: 45,
      stockLevel: 78,
      trend: "up",
      velocity: 4.8,
    },
    {
      id: "3",
      name: "Black Ink Cartridge Set",
      sku: "BIC-012",
      category: "Tattoo Supplies",
      quantitySold: 89,
      revenue: 3560.0,
      profit: 1424.0,
      margin: 40,
      stockLevel: 23,
      trend: "up",
      velocity: 3.0,
    },
    {
      id: "4",
      name: "Surgical Steel Hoops",
      sku: "SSH-045",
      category: "Piercings",
      quantitySold: 78,
      revenue: 1560.0,
      profit: 624.0,
      margin: 40,
      stockLevel: 92,
      trend: "down",
      velocity: 2.6,
    },
  ];

  const bottomPerformingItems: TrendingItem[] = [
    {
      id: "5",
      name: "Vintage Style Stud",
      sku: "VSS-078",
      category: "Piercings",
      quantitySold: 3,
      revenue: 45.0,
      profit: 13.5,
      margin: 30,
      stockLevel: 145,
      trend: "down",
      velocity: 0.1,
    },
    {
      id: "6",
      name: "Legacy Ink Series - Blue",
      sku: "LIS-B23",
      category: "Tattoo Supplies",
      quantitySold: 5,
      revenue: 125.0,
      profit: 37.5,
      margin: 30,
      stockLevel: 67,
      trend: "down",
      velocity: 0.2,
    },
    {
      id: "7",
      name: "Basic Cleaning Solution",
      sku: "BCS-001",
      category: "Aftercare",
      quantitySold: 8,
      revenue: 80.0,
      profit: 24.0,
      margin: 30,
      stockLevel: 234,
      trend: "down",
      velocity: 0.3,
    },
  ];

  // Mock stock alerts
  const stockAlerts: StockAlert[] = [
    {
      id: "1",
      itemName: "Black Ink Cartridge Set",
      sku: "BIC-012",
      category: "Tattoo Supplies",
      currentStock: 23,
      minStock: 50,
      maxStock: 200,
      type: "low",
      daysUntilOut: 8,
      suggestedAction: "Restock immediately - high velocity item",
    },
    {
      id: "2",
      itemName: "Sterile Needles 9RL",
      sku: "SN-9RL",
      category: "Tattoo Supplies",
      currentStock: 12,
      minStock: 30,
      maxStock: 150,
      type: "low",
      daysUntilOut: 4,
      suggestedAction: "Urgent restock required",
    },
    {
      id: "3",
      itemName: "Titanium Studs - 16g",
      sku: "TS-16G",
      category: "Piercings",
      currentStock: 0,
      minStock: 25,
      maxStock: 100,
      type: "out",
      suggestedAction: "Out of stock - expedite order",
    },
    {
      id: "4",
      itemName: "Vintage Style Stud",
      sku: "VSS-078",
      category: "Piercings",
      currentStock: 145,
      minStock: 10,
      maxStock: 30,
      type: "overstock",
      suggestedAction: "Promote with discount or consider discontinuing",
    },
    {
      id: "5",
      itemName: "Basic Cleaning Solution",
      sku: "BCS-001",
      category: "Aftercare",
      currentStock: 234,
      minStock: 20,
      maxStock: 50,
      type: "overstock",
      suggestedAction: "Bundle with other products or run promotion",
    },
  ];

  // Mock expiration alerts
  const expirationAlerts: ExpirationAlert[] = [
    {
      id: "1",
      itemName: "Healing Balm - Premium",
      sku: "HBP-003",
      category: "Aftercare",
      quantity: 12,
      expirationDate: new Date(2026, 2, 15),
      daysUntilExpiration: 66,
      value: 180.0,
      severity: "warning",
    },
    {
      id: "2",
      itemName: "Antiseptic Spray",
      sku: "AS-002",
      category: "Aftercare",
      quantity: 8,
      expirationDate: new Date(2026, 1, 28),
      daysUntilExpiration: 51,
      value: 96.0,
      severity: "warning",
    },
    {
      id: "3",
      itemName: "Numbing Cream",
      sku: "NC-001",
      category: "Supplies",
      quantity: 5,
      expirationDate: new Date(2026, 1, 10),
      daysUntilExpiration: 33,
      value: 125.0,
      severity: "critical",
    },
    {
      id: "4",
      itemName: "Tattoo Transfer Paper",
      sku: "TTP-050",
      category: "Tattoo Supplies",
      quantity: 25,
      expirationDate: new Date(2027, 0, 8),
      daysUntilExpiration: 365,
      value: 375.0,
      severity: "info",
    },
  ];

  // Mock category performance data
  const categoryPerformance: CategoryPerformance[] = [
    {
      id: "1",
      name: "Piercings",
      salesVolume: 567,
      revenue: 17890.5,
      profit: 7156.2,
      margin: 40,
      turnoverRate: 4.2,
      stockValue: 12450.75,
      itemCount: 156,
      trend: "up",
    },
    {
      id: "2",
      name: "Tattoo Supplies",
      salesVolume: 342,
      revenue: 25680.0,
      profit: 10272.0,
      margin: 40,
      turnoverRate: 3.8,
      stockValue: 18920.5,
      itemCount: 89,
      trend: "up",
    },
    {
      id: "3",
      name: "Aftercare",
      salesVolume: 289,
      revenue: 4335.0,
      profit: 1950.75,
      margin: 45,
      turnoverRate: 5.1,
      stockValue: 3456.25,
      itemCount: 67,
      trend: "up",
    },
    {
      id: "4",
      name: "Jewelry",
      salesVolume: 123,
      revenue: 6150.0,
      profit: 1845.0,
      margin: 30,
      turnoverRate: 2.3,
      stockValue: 8970.0,
      itemCount: 234,
      trend: "down",
    },
    {
      id: "5",
      name: "Equipment",
      salesVolume: 45,
      revenue: 8925.0,
      profit: 2677.5,
      margin: 30,
      turnoverRate: 1.5,
      stockValue: 15678.9,
      itemCount: 34,
      trend: "stable",
    },
  ];

  // Mock sales trend data for charts
  const salesTrendData = [
    { date: "Jan 1", sales: 4200, revenue: 5800, profit: 1600 },
    { date: "Jan 8", sales: 4800, revenue: 6400, profit: 1920 },
    { date: "Jan 15", sales: 5100, revenue: 6900, profit: 2070 },
    { date: "Jan 22", sales: 4600, revenue: 6200, profit: 1860 },
    { date: "Jan 29", sales: 5400, revenue: 7300, profit: 2190 },
    { date: "Feb 5", sales: 5800, revenue: 7800, profit: 2340 },
    { date: "Feb 12", sales: 6200, revenue: 8400, profit: 2520 },
  ];

  const categoryDistributionData = categoryPerformance.map((cat) => ({
    name: cat.name,
    value: cat.revenue,
    profit: cat.profit,
  }));

  const COLORS = ["#D78B30", "#C4661F", "#8B6331", "#A67735", "#BF9245"];

  // Filter functions
  const filteredStockAlerts = stockAlerts.filter((alert) => {
    if (alertFilter === "Stock" && alert.type === "overstock") return false;
    if (alertFilter === "Overstock" && alert.type !== "overstock")
      return false;
    return true;
  });

  const filteredExpirationAlerts = expirationAlerts.filter((alert) => {
    const matchesSearch = alert.itemName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredCategories = categoryPerformance.filter((cat) => {
    if (selectedCategory === "All") return true;
    return cat.name === selectedCategory;
  });

  const categories = [
    "All",
    ...categoryPerformance.map((cat) => cat.name),
  ];

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Helper function to format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Render Overview Section
  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6 hover:border-[#D78B30] transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-[#D78B30]/10 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-[#D78B30]" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>{formatPercentage(overviewKPIs.salesGrowth)}</span>
            </div>
          </div>
          <h3 className="text-slate-600 text-sm mb-1">Total Sales</h3>
          <p className="text-2xl text-slate-900">
            {formatCurrency(overviewKPIs.totalSales)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {overviewKPIs.transactionCount} transactions
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6 hover:border-[#D78B30] transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-[#D78B30]/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-[#D78B30]" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>{formatPercentage(overviewKPIs.revenueGrowth)}</span>
            </div>
          </div>
          <h3 className="text-slate-600 text-sm mb-1">Revenue</h3>
          <p className="text-2xl text-slate-900">
            {formatCurrency(overviewKPIs.revenue)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Including tax & fees</p>
        </div>

        {/* Gross Profit */}
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6 hover:border-[#D78B30] transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-[#D78B30]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#D78B30]" />
            </div>
            <div className="flex items-center gap-1 text-slate-600 text-sm">
              <span>{formatPercentage(overviewKPIs.profitMargin)}</span>
            </div>
          </div>
          <h3 className="text-slate-600 text-sm mb-1">Gross Profit</h3>
          <p className="text-2xl text-slate-900">
            {formatCurrency(overviewKPIs.grossProfit)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Profit margin</p>
        </div>

        {/* Inventory Value */}
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6 hover:border-[#D78B30] transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-[#D78B30]/10 rounded-lg">
              <Package className="w-6 h-6 text-[#D78B30]" />
            </div>
          </div>
          <h3 className="text-slate-600 text-sm mb-1">Inventory Value</h3>
          <p className="text-2xl text-slate-900">
            {formatCurrency(overviewKPIs.inventoryValue)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Current stock value</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-slate-900">COGS</h4>
          </div>
          <p className="text-xl text-slate-900">
            {formatCurrency(overviewKPIs.cogs)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Cost of goods sold</p>
        </div>

        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-slate-900">Projected Profit</h4>
          </div>
          <p className="text-xl text-slate-900">
            {formatCurrency(overviewKPIs.projectedProfit)}
          </p>
          <p className="text-xs text-slate-500 mt-1">From on-hand stock</p>
        </div>

        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-slate-900">Avg Transaction</h4>
          </div>
          <p className="text-xl text-slate-900">
            {formatCurrency(
              overviewKPIs.totalSales / overviewKPIs.transactionCount
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">Per transaction value</p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
        <h3 className="text-slate-900 mb-4">Sales Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesTrendData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D78B30" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D78B30" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4661F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C4661F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "2px solid #D78B30",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D78B30"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#C4661F"
              strokeWidth={2}
              fill="url(#colorProfit)"
              name="Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
          <h3 className="text-slate-900 mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={categoryDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "2px solid #D78B30",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
          <h3 className="text-slate-900 mb-4">Top Categories Performance</h3>
          <div className="space-y-3">
            {categoryPerformance.slice(0, 5).map((cat, index) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <p className="text-sm text-slate-900">{cat.name}</p>
                    <p className="text-xs text-slate-500">
                      {cat.salesVolume} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900">
                    {formatCurrency(cat.revenue)}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {cat.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : cat.trend === "down" ? (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    ) : null}
                    <p className="text-xs text-slate-500">
                      {formatPercentage(cat.margin)} margin
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Trending Items Section
  const renderTrending = () => (
    <div className="space-y-6">
      {/* Top Sellers */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D78B30]" />
            <h3 className="text-slate-900">Top Selling Items</h3>
          </div>
          <span className="text-xs text-slate-500 bg-white/50 px-3 py-1 rounded-full">
            Fast movers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/50">
                <th className="text-left text-xs text-slate-600 pb-3 pr-4">
                  Rank
                </th>
                <th className="text-left text-xs text-slate-600 pb-3 pr-4">
                  Item
                </th>
                <th className="text-left text-xs text-slate-600 pb-3 pr-4">
                  Category
                </th>
                <th className="text-right text-xs text-slate-600 pb-3 pr-4">
                  Qty Sold
                </th>
                <th className="text-right text-xs text-slate-600 pb-3 pr-4">
                  Revenue
                </th>
                <th className="text-right text-xs text-slate-600 pb-3 pr-4">
                  Profit
                </th>
                <th className="text-right text-xs text-slate-600 pb-3 pr-4">
                  Velocity
                </th>
                <th className="text-center text-xs text-slate-600 pb-3">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {topSellingItems.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-white/30 hover:bg-white/30 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#D78B30]">
                        #{index + 1}
                      </span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div>
                      <p className="text-sm text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sku}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs bg-white/50 px-2 py-1 rounded-full text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-sm text-slate-900">
                      {item.quantitySold}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-sm text-slate-900">
                      {formatCurrency(item.revenue)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div>
                      <p className="text-sm text-green-600">
                        {formatCurrency(item.profit)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatPercentage(item.margin)}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-sm text-slate-900">
                      {item.velocity.toFixed(1)}/day
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.stockLevel < 30
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {item.stockLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm text-blue-900 mb-1">
                Stock Alert: High Velocity Items
              </h4>
              <p className="text-xs text-blue-700">
                Black Ink Cartridge Set is selling at 3.0 units/day with only
                23 units remaining. Consider restocking to avoid stockouts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Performers */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-slate-900">Bottom Performing Items</h3>
          </div>
          <span className="text-xs text-slate-500 bg-white/50 px-3 py-1 rounded-full">
            Slow movers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/50">
                <th className="text-left text-xs text-slate-600 pb-3 pr-4">
                  Item
                </th>
                <th className="text-left text-xs text-slate-600 pb-3 pr-4">
                  Category
                </th>
                <th className="text-right text-xs text-slate-600 pb-3 pr-4">
                  Qty Sold
                </th>
                <th className="text-right text-xs text-slate-600 pb-3 pr-4">
                  Revenue
                </th>
                <th className="text-right text-xs text-slate-600 pb-3 pr-4">
                  Velocity
                </th>
                <th className="text-center text-xs text-slate-600 pb-3 pr-4">
                  Stock
                </th>
                <th className="text-left text-xs text-slate-600 pb-3">
                  Suggested Action
                </th>
              </tr>
            </thead>
            <tbody>
              {bottomPerformingItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/30 hover:bg-white/30 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div>
                      <p className="text-sm text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sku}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs bg-white/50 px-2 py-1 rounded-full text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-slate-900">
                        {item.quantitySold}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-sm text-slate-900">
                      {formatCurrency(item.revenue)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-sm text-red-600">
                      {item.velocity.toFixed(1)}/day
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                      {item.stockLevel} (High)
                    </span>
                  </td>
                  <td className="py-3">
                    {item.stockLevel > 100 ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                        Discontinue or promote
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Monitor & promote
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-xs text-yellow-900 mb-1">
              Recommended Action
            </h4>
            <p className="text-xs text-yellow-700">
              Run 20% discount promotion on slow movers
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="text-xs text-orange-900 mb-1">
              Dead Stock Value
            </h4>
            <p className="text-xs text-orange-700">
              {formatCurrency(
                bottomPerformingItems.reduce(
                  (sum, item) => sum + item.stockLevel * 15,
                  0
                )
              )}{" "}
              tied up
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-xs text-red-900 mb-1">Consider</h4>
            <p className="text-xs text-red-700">
              Discontinuing items with &lt;0.2/day velocity
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Alerts Section
  const renderAlerts = () => (
    <div className="space-y-6">
      {/* Alert Type Tabs */}
      <div className="flex gap-2 bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-2">
        <button
          onClick={() => setAlertFilter("Stock")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${
            alertFilter === "Stock"
              ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
              : "text-slate-600 hover:bg-white/50"
          }`}
        >
          Stock Alerts
        </button>
        <button
          onClick={() => setAlertFilter("Expiration")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${
            alertFilter === "Expiration"
              ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
              : "text-slate-600 hover:bg-white/50"
          }`}
        >
          Expiration Alerts
        </button>
        <button
          onClick={() => setAlertFilter("Overstock")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${
            alertFilter === "Overstock"
              ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
              : "text-slate-600 hover:bg-white/50"
          }`}
        >
          Overstock
        </button>
      </div>

      {/* Stock Alerts */}
      {alertFilter === "Stock" && (
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-slate-900">Low Stock & Out of Stock Items</h3>
            </div>
            <span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full">
              {
                stockAlerts.filter(
                  (a) => a.type === "low" || a.type === "out"
                ).length
              }{" "}
              alerts
            </span>
          </div>

          <div className="space-y-3">
            {filteredStockAlerts
              .filter((a) => a.type === "low" || a.type === "out")
              .map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-2 ${
                    alert.type === "out"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm text-slate-900">
                          {alert.itemName}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {alert.sku}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Current: {alert.currentStock}
                        </span>
                        <span>Min: {alert.minStock}</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {alert.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {alert.type === "out" ? (
                        <span className="text-xs px-3 py-1 bg-red-600 text-white rounded-full">
                          OUT OF STOCK
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 bg-yellow-600 text-white rounded-full">
                          LOW STOCK
                        </span>
                      )}
                      {alert.daysUntilOut && (
                        <p className="text-xs text-red-700 mt-2">
                          ~{alert.daysUntilOut} days until out
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white/70 rounded-lg">
                    <p className="text-xs text-slate-700">
                      <strong>Action:</strong> {alert.suggestedAction}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Expiration Alerts */}
      {alertFilter === "Expiration" && (
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="text-slate-900">Expiration Alerts</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-white/50 border border-white/50 rounded-lg text-sm focus:outline-none focus:border-[#D78B30]"
                />
              </div>
            </div>
          </div>

          {/* Expiration Timeline Groups */}
          <div className="space-y-4">
            {/* Critical - Expiring Soon */}
            {filteredExpirationAlerts.filter(
              (a) => a.severity === "critical"
            ).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <h4 className="text-sm text-slate-900">
                    Critical - Expiring within 1 month
                  </h4>
                </div>
                <div className="space-y-2">
                  {filteredExpirationAlerts
                    .filter((a) => a.severity === "critical")
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm text-slate-900">
                                {alert.itemName}
                              </h5>
                              <span className="text-xs text-slate-500">
                                {alert.sku}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-600">
                              <span>Qty: {alert.quantity}</span>
                              <span>Value: {formatCurrency(alert.value)}</span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {alert.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-red-600">
                              {alert.daysUntilExpiration} days
                            </p>
                            <p className="text-xs text-slate-500">
                              {alert.expirationDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Warning - Expiring in 1-3 months */}
            {filteredExpirationAlerts.filter((a) => a.severity === "warning")
              .length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <h4 className="text-sm text-slate-900">
                    Warning - Expiring in 1-3 months
                  </h4>
                </div>
                <div className="space-y-2">
                  {filteredExpirationAlerts
                    .filter((a) => a.severity === "warning")
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm text-slate-900">
                                {alert.itemName}
                              </h5>
                              <span className="text-xs text-slate-500">
                                {alert.sku}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-600">
                              <span>Qty: {alert.quantity}</span>
                              <span>Value: {formatCurrency(alert.value)}</span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {alert.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-orange-600">
                              {alert.daysUntilExpiration} days
                            </p>
                            <p className="text-xs text-slate-500">
                              {alert.expirationDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Info - Expiring in 3+ months */}
            {filteredExpirationAlerts.filter((a) => a.severity === "info")
              .length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm text-slate-900">
                    Info - Expiring in 3+ months
                  </h4>
                </div>
                <div className="space-y-2">
                  {filteredExpirationAlerts
                    .filter((a) => a.severity === "info")
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm text-slate-900">
                                {alert.itemName}
                              </h5>
                              <span className="text-xs text-slate-500">
                                {alert.sku}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-600">
                              <span>Qty: {alert.quantity}</span>
                              <span>Value: {formatCurrency(alert.value)}</span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {alert.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-blue-600">
                              {alert.daysUntilExpiration} days
                            </p>
                            <p className="text-xs text-slate-500">
                              {alert.expirationDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overstock Alerts */}
      {alertFilter === "Overstock" && (
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-purple-600" />
              <h3 className="text-slate-900">Overstock Items</h3>
            </div>
            <span className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {stockAlerts.filter((a) => a.type === "overstock").length} items
            </span>
          </div>

          <div className="space-y-3">
            {stockAlerts
              .filter((a) => a.type === "overstock")
              .map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm text-slate-900">
                          {alert.itemName}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {alert.sku}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Current: {alert.currentStock}
                        </span>
                        <span>Max: {alert.maxStock}</span>
                        <span>
                          Overstocked by:{" "}
                          {alert.currentStock - alert.maxStock}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {alert.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 bg-purple-600 text-white rounded-full">
                      OVERSTOCK
                    </span>
                  </div>

                  <div className="p-3 bg-white/70 rounded-lg">
                    <p className="text-xs text-slate-700">
                      <strong>Action:</strong> {alert.suggestedAction}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm text-purple-900 mb-1">
                  Optimize Inventory
                </h4>
                <p className="text-xs text-purple-700">
                  Consider running promotions or bundling slow-moving overstock
                  items to free up capital and storage space.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Category Performance Section
  const renderCategories = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <label className="text-sm text-slate-600">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white/50 border border-white/50 rounded-lg text-sm focus:outline-none focus:border-[#D78B30]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map((category, index) => (
          <div
            key={category.id}
            className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6 hover:border-[#D78B30] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  ></div>
                  <h3 className="text-slate-900">{category.name}</h3>
                </div>
                <p className="text-xs text-slate-500">
                  {category.itemCount} items
                </p>
              </div>
              <div className="flex items-center gap-1">
                {category.trend === "up" ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Trending</span>
                  </div>
                ) : category.trend === "down" ? (
                  <div className="flex items-center gap-1 text-red-600">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs">Declining</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs">Stable</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-[#D78B30]" />
                  <p className="text-xs text-slate-600">Sales Volume</p>
                </div>
                <p className="text-lg text-slate-900">
                  {category.salesVolume}
                </p>
                <p className="text-xs text-slate-500">units sold</p>
              </div>

              <div className="p-3 bg-white/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-[#D78B30]" />
                  <p className="text-xs text-slate-600">Revenue</p>
                </div>
                <p className="text-lg text-slate-900">
                  {formatCurrency(category.revenue)}
                </p>
              </div>

              <div className="p-3 bg-white/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-slate-600">Profit</p>
                </div>
                <p className="text-lg text-green-600">
                  {formatCurrency(category.profit)}
                </p>
                <p className="text-xs text-slate-500">
                  {formatPercentage(category.margin)} margin
                </p>
              </div>

              <div className="p-3 bg-white/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-slate-600">Turnover Rate</p>
                </div>
                <p className="text-lg text-slate-900">
                  {category.turnoverRate.toFixed(1)}x
                </p>
                <p className="text-xs text-slate-500">per month</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">Stock Value</p>
                <p className="text-sm text-slate-900">
                  {formatCurrency(category.stockValue)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Comparison Chart */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
        <h3 className="text-slate-900 mb-4">
          Category Performance Comparison
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={categoryPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "2px solid #D78B30",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#D78B30" name="Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="#C4661F" name="Profit" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Render Insights Section
  const renderInsights = () => (
    <div className="space-y-6">
      {/* Turnover Insights */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-[#D78B30]" />
          <h3 className="text-slate-900">Inventory Turnover Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Overall Turnover</p>
            <p className="text-2xl text-slate-900">3.8x</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              12% vs last month
            </p>
          </div>

          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Fastest Category</p>
            <p className="text-lg text-slate-900">Aftercare</p>
            <p className="text-xs text-slate-500 mt-1">5.1x turnover rate</p>
          </div>

          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Slowest Category</p>
            <p className="text-lg text-slate-900">Equipment</p>
            <p className="text-xs text-slate-500 mt-1">1.5x turnover rate</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm text-blue-900 mb-1">Insight</h4>
              <p className="text-xs text-blue-700">
                Your overall inventory turnover of 3.8x is healthy. Consider
                promoting Equipment category to improve its 1.5x turnover rate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Aging Analysis */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#D78B30]" />
          <h3 className="text-slate-900">Stock Aging Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-900 mb-1">0-30 Days</p>
            <p className="text-lg text-green-700">{formatCurrency(85432)}</p>
            <p className="text-xs text-green-600">36.4%</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900 mb-1">31-60 Days</p>
            <p className="text-lg text-blue-700">{formatCurrency(67234)}</p>
            <p className="text-xs text-blue-600">28.7%</p>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-900 mb-1">61-90 Days</p>
            <p className="text-lg text-yellow-700">{formatCurrency(45123)}</p>
            <p className="text-xs text-yellow-600">19.2%</p>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-900 mb-1">&gt;90 Days</p>
            <p className="text-lg text-red-700">{formatCurrency(36778)}</p>
            <p className="text-xs text-red-600">15.7% - Review</p>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm text-yellow-900 mb-1">Action Required</h4>
              <p className="text-xs text-yellow-700">
                {formatCurrency(36778)} worth of stock has been in inventory for
                over 90 days. Consider promotions or markdowns to improve cash
                flow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Health Score */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[#D78B30]" />
          <h3 className="text-slate-900">Inventory Health Score</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Stock Accuracy</span>
              <span className="text-sm text-green-600">98%</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: "98%" }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Fill Rate</span>
              <span className="text-sm text-green-600">94%</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: "94%" }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Stock Utilization</span>
              <span className="text-sm text-blue-600">76%</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: "76%" }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Stockout Risk</span>
              <span className="text-sm text-yellow-600">12%</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: "12%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm text-green-900">
                  Overall Health: Excellent
                </h4>
                <p className="text-xs text-green-700">
                  Your inventory is well-managed with strong performance metrics
                </p>
              </div>
            </div>
            <div className="text-3xl text-green-600">92/100</div>
          </div>
        </div>
      </div>

      {/* Key Recommendations */}
      <div className="bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-[#D78B30]" />
          <h3 className="text-slate-900">Key Recommendations</h3>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-white/50 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm text-slate-900 mb-1">
                Increase Stock: Black Ink Cartridge Set
              </h4>
              <p className="text-xs text-slate-600">
                High velocity item with low stock. Restock to avoid lost sales.
              </p>
              <button className="mt-2 text-xs text-[#D78B30] hover:text-[#C4661F] flex items-center gap-1">
                Create Purchase Order
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-white/50 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <TrendingDown className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm text-slate-900 mb-1">
                Reduce Dead Stock
              </h4>
              <p className="text-xs text-slate-600">
                7 items have velocity &lt;0.2/day. Consider discount promotions.
              </p>
              <button className="mt-2 text-xs text-[#D78B30] hover:text-[#C4661F] flex items-center gap-1">
                View Items
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-white/50 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Box className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm text-slate-900 mb-1">
                Optimize Equipment Category
              </h4>
              <p className="text-xs text-slate-600">
                Low turnover rate (1.5x). Review pricing and promotion strategy.
              </p>
              <button className="mt-2 text-xs text-[#D78B30] hover:text-[#C4661F] flex items-center gap-1">
                View Category Details
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#f5f5f5] overflow-auto relative">
      {/* Background Logo */}
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-contain opacity-5 pointer-events-none"
        style={{ backgroundImage: `url(${logo})` }}
      ></div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-slate-800 mb-1">Analytics Dashboard</h1>
              <p className="text-slate-600">
                Comprehensive insights into your business performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-lg text-slate-700 hover:border-[#D78B30] transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="flex gap-2 bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-2">
            {(
              ["Today", "Week", "Month", "Quarter", "Year"] as TimePeriod[]
            ).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  timePeriod === period
                    ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
                    : "text-slate-600 hover:bg-white/50"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex gap-2 mb-6 bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-xl p-2 overflow-x-auto">
          <button
            onClick={() => setViewSection("Overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              viewSection === "Overview"
                ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setViewSection("Trending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              viewSection === "Trending"
                ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Trending Items
          </button>
          <button
            onClick={() => setViewSection("Alerts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              viewSection === "Alerts"
                ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Alerts
            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {stockAlerts.filter((a) => a.type !== "overstock").length +
                expirationAlerts.filter((a) => a.severity === "critical")
                  .length}
            </span>
          </button>
          <button
            onClick={() => setViewSection("Categories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              viewSection === "Categories"
                ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            <PieChart className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setViewSection("Insights")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              viewSection === "Insights"
                ? "bg-white/70 text-slate-900 border-2 border-[#D78B30]"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            <Activity className="w-4 h-4" />
            Insights
          </button>
        </div>

        {/* Content Area */}
        {viewSection === "Overview" && renderOverview()}
        {viewSection === "Trending" && renderTrending()}
        {viewSection === "Alerts" && renderAlerts()}
        {viewSection === "Categories" && renderCategories()}
        {viewSection === "Insights" && renderInsights()}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border-2 border-white/50 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900">Export Analytics Report</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full p-4 bg-white/50 border-2 border-white/50 rounded-xl hover:border-[#D78B30] transition-all text-left">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#D78B30]" />
                  <div>
                    <p className="text-sm text-slate-900">Export as PDF</p>
                    <p className="text-xs text-slate-500">
                      Full analytics report with charts
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 bg-white/50 border-2 border-white/50 rounded-xl hover:border-[#D78B30] transition-all text-left">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[#D78B30]" />
                  <div>
                    <p className="text-sm text-slate-900">Export as CSV</p>
                    <p className="text-xs text-slate-500">
                      Raw data for analysis
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 bg-white/50 border-2 border-white/50 rounded-xl hover:border-[#D78B30] transition-all text-left">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[#D78B30]" />
                  <div>
                    <p className="text-sm text-slate-900">
                      Preview Report
                    </p>
                    <p className="text-xs text-slate-500">
                      View before downloading
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="w-full px-4 py-2 bg-white/50 border-2 border-white/50 rounded-lg text-slate-700 hover:border-[#D78B30] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
