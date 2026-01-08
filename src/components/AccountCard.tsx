import {
  Clock,
  Receipt, // DollarSign
  ShoppingCart,
  Package,
  X,
} from "lucide-react";

import { Account } from "../api";

interface AccountCardProps {
  account: Account;
  onSelect: () => void;
  onRemove: () => void;
  removeMode: boolean;
}

export function AccountCard({
  account,
  onSelect,
  onRemove,
  removeMode,
}: AccountCardProps) {
  const formatLastAccess = (dateInput: string | Date | null) => {
    if (!dateInput) return "Never";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins === 0
        ? "Just now"
        : `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `M${amount.toFixed(2)}`;
  };

  return (
    <div
      onClick={removeMode ? undefined : onSelect}
      className={`bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm transition-all duration-200 text-left w-full group border-2 border-white/50 relative ${removeMode
        ? "cursor-default"
        : "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-indigo-200/50"
        }`}
    >
      {/* Remove Button */}
      {removeMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg z-10 cursor-pointer"
          title="Remove account"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header Section - Profile */}
      <div className="flex items-start gap-4 mb-6 pb-5 border-b border-slate-100">
        <div className="relative flex-shrink-0">
          <img
            src={account.profilePicture}
            alt={account.name}
            className={`w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 transition-all ${!removeMode && "group-hover:ring-indigo-200"
              }`}
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 truncate mb-0.5">
            {account.name}
          </h3>
          <p className="text-slate-400 text-xs truncate">
            {account.email}
          </p>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
            <Clock className="w-3 h-3" />
            <span>{formatLastAccess(account.lastAccess)}</span>
          </div>
        </div>
      </div>

      {/* Performance Section - Primary Metric */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">
          Today&apos;s Sales
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl text-slate-900 tracking-tight">
            {formatCurrency(account.dailyStats.totalSales)}
          </span>
          {/* <Receipt className="w-5 h-5 text-emerald-600" /> */}
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`bg-slate-50 rounded-lg p-3 transition-colors ${!removeMode && "group-hover:bg-indigo-50"
            }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">
              Transactions
            </span>
          </div>
          <div className="text-xl text-slate-700">
            {account.dailyStats.transactions}
          </div>
        </div>

        <div
          className={`bg-slate-50 rounded-lg p-3 transition-colors ${!removeMode && "group-hover:bg-indigo-50"
            }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">
              Items Sold
            </span>
          </div>
          <div className="text-xl text-slate-700">
            {account.dailyStats.itemsSold}
          </div>
        </div>
      </div>
    </div>
  );
}