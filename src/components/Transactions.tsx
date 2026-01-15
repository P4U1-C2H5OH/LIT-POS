import React, { useState, useEffect, useCallback } from "react";
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
  User,
} from "lucide-react";
import { api, Transaction, SavedCart } from "../api";

interface TransactionsProps {
  userName: string;
  userProfilePicture: string;
  onResumeCart: (cart: SavedCart) => void;
}



type TimePeriod = "Today" | "Week" | "Month" | "All Time";
type ViewMode = "Transactions" | "Saved Carts";

export function Transactions({
  userName,
  userProfilePicture,
  onResumeCart,
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

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txs, carts] = await Promise.all([
        api.getTransactions(),
        api.getSavedCarts(),
      ]);
      setTransactions(txs);
      setSavedCarts(carts);
    } catch (error) {
      console.error("Failed to fetch transactions/carts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteCart = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this saved cart?")) {
      try {
        await api.deleteSavedCart(id);
        fetchData(); // Refresh
      } catch (error: any) {
        alert("Failed to delete cart: " + error.message);
      }
    }
  };

  const paymentMethods = [
    "All",
    "M-Pesa",
    "EcoCash",
    "Cash",
    "Credit",
    "EFT",
  ];

  // Filter transactions based on period and payment method
  const getFilteredTransactions = useCallback(() => {
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

    let filtered = transactions;

    // Filter by calendar day selection (only when "All Time" is selected)
    if (selectedPeriod === "All Time" && selectedCalendarDay) {
      filtered = filtered.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedCalendarDay.getFullYear() &&
          d.getMonth() === selectedCalendarDay.getMonth() &&
          d.getDate() === selectedCalendarDay.getDate();
      });
    } else {
      // Filter by time period
      switch (selectedPeriod) {
        case "Today":
          filtered = filtered.filter((t) => new Date(t.date) >= today);
          break;
        case "Week":
          filtered = filtered.filter((t) => new Date(t.date) >= weekAgo);
          break;
        case "Month":
          filtered = filtered.filter((t) => new Date(t.date) >= monthAgo);
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
          (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions, selectedPeriod, selectedCalendarDay, selectedPaymentMethod, searchQuery]);

  const filteredTransactions = getFilteredTransactions();

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const txs = getFilteredTransactions();
    const totalSales = txs.reduce(
      (sum, t) => sum + parseFloat(t.total),
      0,
    );
    const totalTransactions = txs.length;
    const totalItems = txs.reduce(
      (sum, t) =>
        sum + t.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );

    return {
      totalSales,
      transactions: totalTransactions,
      itemsSold: totalItems,
    };
  }, [getFilteredTransactions]);

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
  const generateCalendarDays = useCallback(() => {
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
      const dayTransactions = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() === day;
      });
      const dayTotal = dayTransactions.reduce(
        (sum, t) => sum + parseFloat(t.total),
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
  }, [currentMonth, transactions]);

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

  // Assuming 'logo' is imported or defined elsewhere
  const logo = "/path/to/your/logo.png"; // Placeholder for logo path

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
                                        {formatDate(new Date(transaction.date))}{" "}
                                        at{" "}
                                        {formatTime(new Date(transaction.date))}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      {transaction.customerAvatar ? (
                                        <img
                                          src={transaction.customerAvatar}
                                          alt={transaction.customerName}
                                          className="w-8 h-8 rounded-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";
                                          }}
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                          <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                      )}
                                      <span className="text-sm text-slate-900">
                                        {transaction.customerName || "Walk-in"}
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
                                      {parseFloat(transaction.total).toFixed(2)}
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
                                  {formatDate(new Date(cart.savedDate))}{" "}
                                  at{" "}
                                  {formatTime(new Date(cart.savedDate))}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {cart.customerAvatar ? (
                                  <img
                                    src={cart.customerAvatar}
                                    alt={cart.customerName}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                                <span className="text-sm text-slate-900">
                                  {cart.customerName || "No Customer"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                {formatDate(new Date(cart.savedDate))}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">
                                M{parseFloat(cart.total).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedCart(cart)}
                                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4 text-slate-600" />
                                </button>
                                <button
                                  onClick={() => onResumeCart(cart)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Resume Checkout"
                                >
                                  <PlayCircle className="w-4 h-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCart(cart.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Cart"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
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
                {selectedTransaction.customerAvatar ? (
                  <img
                    src={selectedTransaction.customerAvatar}
                    alt={selectedTransaction.customerName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="text-slate-900">
                    {selectedTransaction.customerName || "Walk-in"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(new Date(selectedTransaction.date))} at{" "}
                    {formatTime(new Date(selectedTransaction.date))}
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
                {(selectedTransaction.items || []).map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/50 rounded-lg p-3 border border-white/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-slate-500">
                        M{parseFloat(item.price_at_sale).toFixed(2)} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm text-slate-900">
                      M
                      {(parseFloat(item.price_at_sale) * item.quantity).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                ))}
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
                  M{parseFloat(selectedTransaction.subtotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Tax (15%)
                </span>
                <span className="text-slate-900">
                  M{parseFloat(selectedTransaction.tax).toFixed(2)}
                </span>
              </div>
              {parseFloat(selectedTransaction.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    Discount
                  </span>
                  <span className="text-green-600">
                    -M{parseFloat(selectedTransaction.discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="text-slate-900">Total</span>
                <span className="text-[#D78B30] text-xl">
                  M{parseFloat(selectedTransaction.total).toFixed(2)}
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
                {selectedCart.customerAvatar ? (
                  <img
                    src={selectedCart.customerAvatar}
                    alt={selectedCart.customerName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="text-slate-900">
                    {selectedCart.customerName || "No Customer"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(new Date(selectedCart.savedDate))} at{" "}
                    {formatTime(new Date(selectedCart.savedDate))}
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
                        {item.itemName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">
                  M{parseFloat(selectedCart.subtotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Tax (15%)
                </span>
                <span className="text-slate-900">
                  M{parseFloat(selectedCart.tax).toFixed(2)}
                </span>
              </div>
              {parseFloat(selectedCart.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    Discount
                  </span>
                  <span className="text-green-600">
                    -M{parseFloat(selectedCart.discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="text-slate-900">Total</span>
                <span className="text-[#D78B30] text-xl">
                  M{parseFloat(selectedCart.total).toFixed(2)}
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
                  onResumeCart(selectedCart);
                  setSelectedCart(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#D78B30] hover:bg-[#C4661F] text-white px-4 py-3 rounded-xl transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                <span className="text-sm">Resume Checkout</span>
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this saved cart?")) {
                    handleDeleteCart(selectedCart.id);
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
                    {transactions
                      .filter((t: any) => {
                        const d = new Date(t.date);
                        return d.getFullYear() === selectedCalendarDay.getFullYear() &&
                          d.getMonth() === selectedCalendarDay.getMonth() &&
                          d.getDate() === selectedCalendarDay.getDate();
                      })
                      .map((t: any) => {
                        const style = getPaymentMethodStyle(t.paymentMethod);
                        const Icon = style.icon;
                        return (
                          <tr key={t.id} className="hover:bg-white/30 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-slate-900 font-medium">{t.transactionNumber}</p>
                                <p className="text-xs text-slate-500">{formatTime(new Date(t.date))}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {t.customerAvatar ? (
                                  <img
                                    src={t.customerAvatar}
                                    alt={t.customerName}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                                <span className="text-sm text-slate-900">{t.customerName || "Walk-in"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex items-center gap-2 ${style.bg} ${style.color} px-2 py-1 rounded-lg w-fit`}>
                                <Icon className="w-3 h-3" />
                                <span className="text-xs">{t.paymentMethod}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900">
                              M{parseFloat(t.total).toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${t.status === "Completed" ? "bg-green-100 text-green-700" :
                                t.status === "Refunded" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedTransaction(t)}
                                className="p-1 hover:bg-white/50 rounded-lg transition-colors"
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