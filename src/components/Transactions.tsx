import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Download,
  Eye,
  X,
  CreditCard,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
  PlayCircle,
} from "lucide-react";
import logo from "figma:asset/9a588303adbb1fdb50d30917cd5d81adce6d930a.png";

interface TransactionsProps {
  userName: string;
  userProfilePicture: string;
}

interface Transaction {
  id: string;
  transactionNumber: string;
  date: Date;
  customer: {
    name: string;
    avatar: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod:
  | "M-Pesa"
  | "EcoCash"
  | "Cash"
  | "Credit"
  | "EFT";
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "Completed" | "Refunded" | "Pending";
}

interface SavedCart {
  id: string;
  cartNumber: string;
  savedDate: Date;
  customer: {
    name: string;
    avatar: string;
    phone: string;
  };
  items: {
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
}

type TimePeriod = "Today" | "Week" | "Month" | "All Time";
type ViewMode = "Transactions" | "Saved Carts";

export function Transactions({
  userName,
  userProfilePicture,
}: TransactionsProps) {
  const [selectedPeriod, setSelectedPeriod] =
    useState<TimePeriod>("Today");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] =
    useState<ViewMode>("Transactions");
  const [selectedCart, setSelectedCart] =
    useState<SavedCart | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDay] =
    useState<Date | null>(null);

  const paymentMethods = [
    "All",
    "M-Pesa",
    "EcoCash",
    "Cash",
    "Credit",
    "EFT",
  ];

  // Mock saved carts data
  const savedCarts: SavedCart[] = [
    {
      id: "cart-1",
      cartNumber: "CART-2025-001",
      savedDate: new Date(2025, 0, 3, 10, 30),
      customer: {
        name: "Sam Edwards",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        phone: "(415) 555-0132",
      },
      items: [
        {
          name: "Paracetamol 500mg",
          sku: "MED-001",
          quantity: 3,
          price: 5.99,
        },
        {
          name: "Vitamin C Tablets",
          sku: "SUP-012",
          quantity: 2,
          price: 12.5,
        },
        {
          name: "Hand Sanitizer 500ml",
          sku: "HYG-008",
          quantity: 1,
          price: 8.99,
        },
      ],
      subtotal: 51.96,
      tax: 7.79,
      discount: 0,
      total: 59.75,
      notes:
        "Customer will return tomorrow to complete purchase",
    },
    {
      id: "cart-2",
      cartNumber: "CART-2025-002",
      savedDate: new Date(2025, 0, 2, 16, 15),
      customer: {
        name: "Jessica Williams",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        phone: "(415) 555-0198",
      },
      items: [
        {
          name: "Blood Pressure Monitor",
          sku: "DEV-003",
          quantity: 1,
          price: 45.99,
        },
        {
          name: "Thermometer Digital",
          sku: "DEV-007",
          quantity: 1,
          price: 18.5,
        },
      ],
      subtotal: 64.49,
      tax: 9.67,
      discount: 6.45,
      total: 67.71,
      notes: "Waiting for insurance approval",
    },
    {
      id: "cart-3",
      cartNumber: "CART-2025-003",
      savedDate: new Date(2025, 0, 1, 14, 45),
      customer: {
        name: "Michael Chen",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
        phone: "(415) 555-0145",
      },
      items: [
        {
          name: "Multivitamin Tablets",
          sku: "SUP-024",
          quantity: 5,
          price: 16.99,
        },
        {
          name: "Ibuprofen 400mg",
          sku: "MED-005",
          quantity: 3,
          price: 7.25,
        },
      ],
      subtotal: 106.7,
      tax: 16.01,
      discount: 10.67,
      total: 112.04,
      notes: "Regular customer - monthly vitamin stock",
    },
    {
      id: "cart-4",
      cartNumber: "CART-2024-512",
      savedDate: new Date(2024, 11, 30, 11, 20),
      customer: {
        name: "Anna Martinez",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        phone: "(415) 555-0167",
      },
      items: [
        {
          name: "Face Mask Box (50pcs)",
          sku: "HYG-015",
          quantity: 2,
          price: 15.0,
        },
        {
          name: "Surgical Gloves Box",
          sku: "HYG-022",
          quantity: 1,
          price: 13.5,
        },
      ],
      subtotal: 43.5,
      tax: 6.53,
      discount: 0,
      total: 50.03,
    },
  ];

  // Mock transaction data
  const allTransactions: Transaction[] = [
    // Today
    {
      id: "1",
      transactionNumber: "TXN-2025-001",
      date: new Date(2026, 0, 1, 14, 30),
      customer: {
        name: "Sam Edwards",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      },
      items: [
        { name: "Paracetamol 500mg", quantity: 2, price: 5.99 },
        { name: "Vitamin C Tablets", quantity: 1, price: 12.5 },
      ],
      paymentMethod: "M-Pesa",
      subtotal: 24.48,
      tax: 3.67,
      discount: 0,
      total: 28.15,
      status: "Completed",
    },
    {
      id: "2",
      transactionNumber: "TXN-2025-002",
      date: new Date(2026, 0, 1, 15, 45),
      customer: {
        name: "Jessica Williams",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      },
      items: [
        {
          name: "Hand Sanitizer 500ml",
          quantity: 3,
          price: 8.99,
        },
        {
          name: "Face Mask Box (50pcs)",
          quantity: 2,
          price: 15.0,
        },
      ],
      paymentMethod: "Cash",
      subtotal: 56.97,
      tax: 8.55,
      discount: 5.7,
      total: 59.82,
      status: "Completed",
    },
    {
      id: "3",
      transactionNumber: "TXN-2025-003",
      date: new Date(2026, 0, 1, 11, 20),
      customer: {
        name: "Michael Chen",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      },
      items: [
        {
          name: "Blood Pressure Monitor",
          quantity: 1,
          price: 45.99,
        },
      ],
      paymentMethod: "Credit",
      subtotal: 45.99,
      tax: 6.9,
      discount: 0,
      total: 52.89,
      status: "Completed",
    },
    {
      id: "4",
      transactionNumber: "TXN-2025-004",
      date: new Date(2026, 0, 1, 9, 15),
      customer: {
        name: "Anna Martinez",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      },
      items: [
        { name: "Ibuprofen 400mg", quantity: 2, price: 7.25 },
        { name: "Cough Syrup", quantity: 1, price: 11.5 },
        {
          name: "Thermometer Digital",
          quantity: 1,
          price: 18.5,
        },
      ],
      paymentMethod: "EcoCash",
      subtotal: 44.5,
      tax: 6.68,
      discount: 0,
      total: 51.18,
      status: "Completed",
    },
    // Yesterday
    {
      id: "5",
      transactionNumber: "TXN-2024-287",
      date: new Date(2025, 11, 31, 16, 30),
      customer: {
        name: "David Lee",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      },
      items: [
        { name: "Bandages Pack", quantity: 2, price: 6.75 },
        { name: "Antiseptic Cream", quantity: 1, price: 9.99 },
      ],
      paymentMethod: "Cash",
      subtotal: 23.49,
      tax: 3.52,
      discount: 0,
      total: 27.01,
      status: "Completed",
    },
    {
      id: "6",
      transactionNumber: "TXN-2024-286",
      date: new Date(2025, 11, 31, 14, 15),
      customer: {
        name: "Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      },
      items: [
        {
          name: "Multivitamin Tablets",
          quantity: 3,
          price: 16.99,
        },
      ],
      paymentMethod: "M-Pesa",
      subtotal: 50.97,
      tax: 7.65,
      discount: 5.1,
      total: 53.52,
      status: "Completed",
    },
    // Last Week
    {
      id: "7",
      transactionNumber: "TXN-2024-278",
      date: new Date(2025, 11, 28, 10, 30),
      customer: {
        name: "Robert Wilson",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      },
      items: [
        {
          name: "Surgical Gloves Box",
          quantity: 2,
          price: 13.5,
        },
        {
          name: "Hand Sanitizer 500ml",
          quantity: 4,
          price: 8.99,
        },
      ],
      paymentMethod: "EFT",
      subtotal: 62.96,
      tax: 9.44,
      discount: 0,
      total: 72.4,
      status: "Completed",
    },
    {
      id: "8",
      transactionNumber: "TXN-2024-265",
      date: new Date(2025, 11, 25, 13, 45),
      customer: {
        name: "Emma Davis",
        avatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
      },
      items: [
        { name: "Paracetamol 500mg", quantity: 1, price: 5.99 },
      ],
      paymentMethod: "Cash",
      subtotal: 5.99,
      tax: 0.9,
      discount: 0,
      total: 6.89,
      status: "Refunded",
    },
    // Last Month
    {
      id: "9",
      transactionNumber: "TXN-2024-198",
      date: new Date(2025, 11, 15, 11, 20),
      customer: {
        name: "James Anderson",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      },
      items: [
        {
          name: "Blood Pressure Monitor",
          quantity: 1,
          price: 45.99,
        },
        {
          name: "Thermometer Digital",
          quantity: 1,
          price: 18.5,
        },
      ],
      paymentMethod: "Credit",
      subtotal: 64.49,
      tax: 9.67,
      discount: 6.45,
      total: 67.71,
      status: "Completed",
    },
    {
      id: "10",
      transactionNumber: "TXN-2024-165",
      date: new Date(2025, 11, 2, 15, 10),
      customer: {
        name: "Lisa Brown",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
      },
      items: [
        { name: "Vitamin C Tablets", quantity: 2, price: 12.5 },
        {
          name: "Multivitamin Tablets",
          quantity: 1,
          price: 16.99,
        },
      ],
      paymentMethod: "M-Pesa",
      subtotal: 41.99,
      tax: 6.3,
      discount: 0,
      total: 48.29,
      status: "Completed",
    },
  ];

  // Filter transactions based on period and payment method
  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let filtered = allTransactions;

    // Filter by calendar day selection (only when "All Time" is selected)
    if (selectedPeriod === "All Time" && selectedCalendarDay) {
      filtered = filtered.filter(
        (t) =>
          t.date.getFullYear() ===
          selectedCalendarDay.getFullYear() &&
          t.date.getMonth() ===
          selectedCalendarDay.getMonth() &&
          t.date.getDate() === selectedCalendarDay.getDate(),
      );
    } else {
      // Filter by time period
      switch (selectedPeriod) {
        case "Today":
          filtered = filtered.filter((t) => t.date >= today);
          break;
        case "Week":
          filtered = filtered.filter((t) => t.date >= weekAgo);
          break;
        case "Month":
          filtered = filtered.filter((t) => t.date >= monthAgo);
          break;
        case "All Time":
          // No filtering
          break;
      }
    }

    // Filter by payment method
    if (selectedPaymentMethod !== "All") {
      filtered = filtered.filter(
        (t) => t.paymentMethod === selectedPaymentMethod,
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.transactionNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          t.customer.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    return filtered.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate statistics
  const calculateStats = () => {
    const transactions = getFilteredTransactions();
    const totalSales = transactions.reduce(
      (sum, t) => sum + t.total,
      0,
    );
    const totalTransactions = transactions.length;
    const totalItems = transactions.reduce(
      (sum, t) =>
        sum + t.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );

    return {
      totalSales,
      transactions: totalTransactions,
      itemsSold: totalItems,
    };
  };

  const stats = calculateStats();

  // Get payment method icon and color
  const getPaymentMethodStyle = (method: string) => {
    const styles: Record<
      string,
      { icon: any; color: string; bg: string }
    > = {
      "M-Pesa": {
        icon: Smartphone,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      EcoCash: {
        icon: Smartphone,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      Cash: {
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
      },
      Credit: {
        icon: CreditCard,
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
      EFT: {
        icon: CreditCard,
        color: "text-indigo-600",
        bg: "bg-indigo-100",
      },
    };
    return (
      styles[method] || {
        icon: DollarSign,
        color: "text-slate-600",
        bg: "bg-slate-100",
      }
    );
  };

  // Generate calendar view for the month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTransactions = allTransactions.filter(
        (t) =>
          t.date.getFullYear() === year &&
          t.date.getMonth() === month &&
          t.date.getDate() === day,
      );
      const dayTotal = dayTransactions.reduce(
        (sum, t) => sum + t.total,
        0,
      );

      days.push({
        date: day,
        fullDate: date,
        hasTransactions: dayTransactions.length > 0,
        transactionCount: dayTransactions.length,
        total: dayTotal,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const prevMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1,
      ),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1,
      ),
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            <h1 className="text-slate-900 mb-1">
              Transaction History
            </h1>
            <p className="text-slate-500 text-sm">
              View and manage all your transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors w-64"
              />
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-xl px-4 py-2 hover:border-[#D78B30] transition-colors">
              <Download className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">
                Export
              </span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Sales Card */}
          <div className="bg-gradient-to-br from-green-100 to-green-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">
                💰 Total Sales
              </span>
            </div>
            <div className="text-3xl text-slate-900 mb-1">
              M{stats.totalSales.toFixed(2)}
            </div>
            <p className="text-xs text-green-700">
              {selectedPeriod}
            </p>
          </div>

          {/* Transactions Card */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">
                📊 Transactions
              </span>
            </div>
            <div className="text-3xl text-slate-900 mb-1">
              {stats.transactions}
            </div>
            <p className="text-xs text-blue-700">
              {selectedPeriod}
            </p>
          </div>

          {/* Items Sold Card */}
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-700">
                📦 Items Sold
              </span>
            </div>
            <div className="text-3xl text-slate-900 mb-1">
              {stats.itemsSold}
            </div>
            <p className="text-xs text-purple-700">
              {selectedPeriod}
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-2 shadow-sm border-2 border-white/50 mb-6 flex gap-2 w-fit">
          <button
            onClick={() => setViewMode("Transactions")}
            className={`px-6 py-2.5 rounded-xl text-sm transition-all ${viewMode === "Transactions"
              ? "bg-[#D78B30] text-white shadow-sm"
              : "text-slate-600 hover:bg-white/50"
              }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Transactions</span>
            </div>
          </button>
          <button
            onClick={() => setViewMode("Saved Carts")}
            className={`px-6 py-2.5 rounded-xl text-sm transition-all ${viewMode === "Saved Carts"
              ? "bg-[#D78B30] text-white shadow-sm"
              : "text-slate-600 hover:bg-white/50"
              }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Saved Carts ({savedCarts.length})</span>
            </div>
          </button>
        </div>

        {/* Conditionally render based on view mode */}
        {viewMode === "Transactions" ? (
          <>
            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Time Period Filter */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">
                    Period:
                  </span>
                  <div className="flex items-center gap-2 bg-white/50 rounded-lg p-1">
                    {(
                      [
                        "Today",
                        "Week",
                        "Month",
                        "All Time",
                      ] as TimePeriod[]
                    ).map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          setSelectedPeriod(period);
                          // Clear calendar day selection when switching away from "All Time"
                          if (period !== "All Time") {
                            setSelectedCalendarDay(null);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${selectedPeriod === period
                          ? "bg-[#D78B30] text-white shadow-sm"
                          : "text-slate-600 hover:bg-white/50"
                          }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">
                    Payment:
                  </span>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedPaymentMethod(e.target.value)
                    }
                    className="bg-white/50 border-2 border-white/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  {selectedPeriod === "All Time" &&
                    selectedCalendarDay && (
                      <div className="flex items-center gap-2 bg-[#D78B30]/20 border border-[#D78B30] rounded-lg px-3 py-1.5">
                        <Calendar className="w-3 h-3 text-[#D78B30]" />
                        <span className="text-xs text-[#D78B30]">
                          {formatDate(selectedCalendarDay)}
                        </span>
                        <button
                          onClick={() =>
                            setSelectedCalendarDay(null)
                          }
                          className="hover:bg-[#D78B30]/30 rounded p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3 text-[#D78B30]" />
                        </button>
                      </div>
                    )}
                  <span className="text-sm text-slate-500">
                    Showing {filteredTransactions.length}{" "}
                    transaction
                    {filteredTransactions.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transactions List */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border-2 border-white/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/50">
                        <tr>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Transaction
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Customer
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Payment
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Amount
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Status
                          </th>
                          <th className="text-left text-xs text-slate-500 px-6 py-4">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-12 text-center"
                            >
                              <div className="flex flex-col items-center">
                                <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                                <p className="text-slate-400 text-sm">
                                  No transactions found
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                  Try adjusting your filters
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.map(
                            (transaction) => {
                              const paymentStyle =
                                getPaymentMethodStyle(
                                  transaction.paymentMethod,
                                );
                              const PaymentIcon =
                                paymentStyle.icon;

                              return (
                                <tr
                                  key={transaction.id}
                                  className="hover:bg-white/30 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div>
                                      <p className="text-sm text-slate-900">
                                        {
                                          transaction.transactionNumber
                                        }
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {formatDate(
                                          transaction.date,
                                        )}{" "}
                                        at{" "}
                                        {formatTime(
                                          transaction.date,
                                        )}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={
                                          transaction.customer
                                            .avatar
                                        }
                                        alt={
                                          transaction.customer
                                            .name
                                        }
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                      <span className="text-sm text-slate-900">
                                        {
                                          transaction.customer
                                            .name
                                        }
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div
                                      className={`flex items-center gap-2 ${paymentStyle.bg} ${paymentStyle.color} px-3 py-1.5 rounded-lg w-fit`}
                                    >
                                      <PaymentIcon className="w-3 h-3" />
                                      <span className="text-xs">
                                        {
                                          transaction.paymentMethod
                                        }
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-900">
                                      M
                                      {transaction.total.toFixed(
                                        2,
                                      )}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`text-xs px-3 py-1 rounded-full ${transaction.status ===
                                        "Completed"
                                        ? "bg-green-100 text-green-700"
                                        : transaction.status ===
                                          "Refunded"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                                      {transaction.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() =>
                                        setSelectedTransaction(
                                          transaction,
                                        )
                                      }
                                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                    >
                                      <Eye className="w-4 h-4 text-slate-600" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            },
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-900">
                      Activity Calendar
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevMonth}
                        className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="text-sm text-slate-900">
                        {currentMonth.toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {[
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ].map((day) => (
                      <div
                        key={day}
                        className="text-xs text-slate-500 text-center py-2"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((day, index) => {
                      const isSelected =
                        selectedPeriod === "All Time" &&
                        selectedCalendarDay &&
                        day &&
                        day.fullDate.getFullYear() ===
                        selectedCalendarDay.getFullYear() &&
                        day.fullDate.getMonth() ===
                        selectedCalendarDay.getMonth() &&
                        day.fullDate.getDate() ===
                        selectedCalendarDay.getDate();

                      return (
                        <div
                          key={index}
                          className={`aspect-square p-1 ${day
                            ? isSelected
                              ? "bg-[#D78B30] border-2 border-[#C4661F] rounded-lg cursor-pointer"
                              : day.hasTransactions
                                ? "bg-[#D78B30]/20 border-2 border-[#D78B30] rounded-lg cursor-pointer hover:bg-[#D78B30]/30"
                                : "bg-white/30 rounded-lg"
                            : ""
                            }`}
                          title={
                            day && day.hasTransactions
                              ? `${day.transactionCount} transaction(s) - M${day.total.toFixed(2)}`
                              : ""
                          }
                          onClick={() => {
                            if (
                              day &&
                              day.hasTransactions &&
                              selectedPeriod === "All Time"
                            ) {
                              if (isSelected) {
                                // If clicking the same day, deselect it
                                setSelectedCalendarDay(null);
                              } else {
                                // Otherwise, select this day
                                setSelectedCalendarDay(
                                  day.fullDate,
                                );
                              }
                            }
                          }}
                        >
                          {day && (
                            <div className="flex flex-col items-center justify-center h-full">
                              <span
                                className={`text-xs ${isSelected
                                  ? "text-white font-bold"
                                  : "text-slate-900"
                                  }`}
                              >
                                {day.date}
                              </span>
                              {day.hasTransactions && (
                                <div
                                  className={`w-1 h-1 rounded-full mt-0.5 ${isSelected
                                    ? "bg-white"
                                    : "bg-[#D78B30]"
                                    }`}
                                ></div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3 bg-white/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#D78B30]/20 border-2 border-[#D78B30] rounded"></div>
                      <span className="text-xs text-slate-600">
                        Days with transactions
                      </span>
                    </div>
                    {selectedPeriod === "All Time" && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#D78B30] border-2 border-[#C4661F] rounded"></div>
                        <span className="text-xs text-slate-600">
                          Selected day (click to filter)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white/30 rounded"></div>
                      <span className="text-xs text-slate-600">
                        Days without activity
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Saved Carts List */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border-2 border-white/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50">
                    <tr>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Cart
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Customer
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Date
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Total
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savedCarts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-slate-400 text-sm">
                              No saved carts found
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                              Try adjusting your filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      savedCarts.map((cart) => {
                        return (
                          <tr
                            key={cart.id}
                            className="hover:bg-white/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-slate-900">
                                  {cart.cartNumber}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatDate(cart.savedDate)}{" "}
                                  at{" "}
                                  {formatTime(cart.savedDate)}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={cart.customer.avatar}
                                  alt={cart.customer.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-sm text-slate-900">
                                  {cart.customer.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                {formatDate(cart.savedDate)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                M{cart.total.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  setSelectedCart(cart)
                                }
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4 text-slate-600" />
                              </button>
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
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full border-2 border-white/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-900 text-xl mb-1">
                  Transaction Details
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedTransaction.transactionNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-white/50 rounded-xl p-4 mb-4 border border-white/50">
              <p className="text-xs text-slate-500 mb-2">
                Customer
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={selectedTransaction.customer.avatar}
                  alt={selectedTransaction.customer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-slate-900">
                    {selectedTransaction.customer.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(selectedTransaction.date)} at{" "}
                    {formatTime(selectedTransaction.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-3">
                Items Purchased
              </p>
              <div className="space-y-2">
                {selectedTransaction.items.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/50 rounded-lg p-3 border border-white/50"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          M{item.price.toFixed(2)} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm text-slate-900">
                        M
                        {(item.price * item.quantity).toFixed(
                          2,
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white/50 rounded-xl p-4 mb-4 border border-white/50">
              <p className="text-xs text-slate-500 mb-3">
                Payment Method
              </p>
              {(() => {
                const paymentStyle = getPaymentMethodStyle(
                  selectedTransaction.paymentMethod,
                );
                const PaymentIcon = paymentStyle.icon;
                return (
                  <div
                    className={`flex items-center gap-2 ${paymentStyle.bg} ${paymentStyle.color} px-4 py-2 rounded-lg w-fit`}
                  >
                    <PaymentIcon className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedTransaction.paymentMethod}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Transaction Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">
                  M{selectedTransaction.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Tax (15%)
                </span>
                <span className="text-slate-900">
                  M{selectedTransaction.tax.toFixed(2)}
                </span>
              </div>
              {selectedTransaction.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    Discount
                  </span>
                  <span className="text-green-600">
                    -M{selectedTransaction.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="text-slate-900">Total</span>
                <span className="text-[#D78B30] text-xl">
                  M{selectedTransaction.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="mt-6 flex items-center justify-between">
              <span
                className={`px-4 py-2 rounded-full text-sm ${selectedTransaction.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : selectedTransaction.status === "Refunded"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {selectedTransaction.status}
              </span>
              <button className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm">
                  Download Receipt
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Cart Details Modal */}
      {selectedCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full border-2 border-white/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-900 text-xl mb-1">
                  Saved Cart Details
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedCart.cartNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedCart(null)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-white/50 rounded-xl p-4 mb-4 border border-white/50">
              <p className="text-xs text-slate-500 mb-2">
                Customer
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={selectedCart.customer.avatar}
                  alt={selectedCart.customer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-slate-900">
                    {selectedCart.customer.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(selectedCart.savedDate)} at{" "}
                    {formatTime(selectedCart.savedDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-3">
                Items Purchased
              </p>
              <div className="space-y-2">
                {selectedCart.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/50 rounded-lg p-3 border border-white/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        M{item.price.toFixed(2)} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm text-slate-900">
                      M{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">
                  M{selectedCart.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Tax (15%)
                </span>
                <span className="text-slate-900">
                  M{selectedCart.tax.toFixed(2)}
                </span>
              </div>
              {selectedCart.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    Discount
                  </span>
                  <span className="text-green-600">
                    -M{selectedCart.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="text-slate-900">Total</span>
                <span className="text-[#D78B30] text-xl">
                  M{selectedCart.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedCart.notes && (
              <div className="mt-6 bg-white/50 rounded-xl p-4 border border-white/50">
                <p className="text-xs text-slate-500 mb-2">
                  Notes
                </p>
                <p className="text-sm text-slate-900">
                  {selectedCart.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  console.log("Resume cart:", selectedCart.id);
                  alert("Resuming cart in checkout...");
                  setSelectedCart(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#D78B30] hover:bg-[#C4661F] text-white px-4 py-3 rounded-xl transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                <span className="text-sm">Resume Checkout</span>
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete this saved cart?",
                    )
                  ) {
                    console.log(
                      "Delete cart:",
                      selectedCart.id,
                    );
                    alert("Cart deleted successfully!");
                    setSelectedCart(null);
                  }
                }}
                className="flex items-center gap-2 bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 px-4 py-3 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Day Details Modal */}
      {selectedCalendarDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-4xl w-full border-2 border-white/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-900 text-xl mb-1">
                  Transactions on{" "}
                  {formatDate(selectedCalendarDay)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCalendarDay(null)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Transactions List */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border-2 border-white/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50">
                    <tr>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Transaction
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Customer
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Payment
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Amount
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Status
                      </th>
                      <th className="text-left text-xs text-slate-500 px-6 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allTransactions
                      .filter(
                        (t) =>
                          t.date.getFullYear() ===
                          selectedCalendarDay.getFullYear() &&
                          t.date.getMonth() ===
                          selectedCalendarDay.getMonth() &&
                          t.date.getDate() ===
                          selectedCalendarDay.getDate(),
                      )
                      .map((transaction) => {
                        const paymentStyle =
                          getPaymentMethodStyle(
                            transaction.paymentMethod,
                          );
                        const PaymentIcon = paymentStyle.icon;

                        return (
                          <tr
                            key={transaction.id}
                            className="hover:bg-white/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-slate-900">
                                  {
                                    transaction.transactionNumber
                                  }
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatDate(transaction.date)}{" "}
                                  at{" "}
                                  {formatTime(transaction.date)}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    transaction.customer.avatar
                                  }
                                  alt={
                                    transaction.customer.name
                                  }
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-sm text-slate-900">
                                  {transaction.customer.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className={`flex items-center gap-2 ${paymentStyle.bg} ${paymentStyle.color} px-3 py-1.5 rounded-lg w-fit`}
                              >
                                <PaymentIcon className="w-3 h-3" />
                                <span className="text-xs">
                                  {transaction.paymentMethod}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                M{transaction.total.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${transaction.status ===
                                  "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : transaction.status ===
                                    "Refunded"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                  }`}
                              >
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  setSelectedTransaction(
                                    transaction,
                                  )
                                }
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4 text-slate-600" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}