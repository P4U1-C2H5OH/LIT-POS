import React, { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Users,
  ShoppingBag,
  FileText,
  Receipt,
  CreditCard,
  UserCircle,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ShoppingCart,
  Package,
} from "lucide-react";

interface SidebarProps {
  userName: string;
  userProfilePicture: string;
  userRole: string;
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({
  userName,
  userProfilePicture,
  userRole,
  onLogout,
  currentPage,
  onPageChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", badge: null, roles: ["ADMIN", "MANAGER"] },
    { icon: ShoppingCart, label: "Checkout", badge: null, roles: ["ADMIN", "MANAGER", "CASHIER"] },
    {
      icon: ArrowLeftRight,
      label: "Transactions",
      badge: null,
      roles: ["ADMIN", "MANAGER", "CASHIER"],
    },
    { icon: Package, label: "Inventory", badge: null, roles: ["ADMIN", "MANAGER"] },
    { icon: BarChart3, label: "Analytics", badge: 2, roles: ["ADMIN", "MANAGER"] },
    { icon: Users, label: "Employee", badge: null, roles: ["ADMIN", "MANAGER"] },
    { icon: ShoppingBag, label: "Orders", badge: null, roles: ["ADMIN", "MANAGER"] },
    { icon: FileText, label: "Invoice", badge: null, roles: ["ADMIN", "MANAGER"] },
    { icon: Receipt, label: "Reports", badge: null, roles: ["ADMIN", "MANAGER"] },
    { icon: CreditCard, label: "Billing", badge: null, roles: ["ADMIN", "MANAGER"] },
  ];

  const allSettingsItems = [
    { icon: UserCircle, label: "Edit Profile", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { icon: CreditCard, label: "Edit Payment Details", roles: ["ADMIN", "MANAGER"] },
    { icon: Settings, label: "Settings", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { icon: LogOut, label: "Sign out", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));
  const settingsItems = allSettingsItems.filter(item => item.roles.includes(userRole));

  const accountItems = [
    { icon: Bell, label: "Notifications" },
    { icon: UserCircle, label: "Account" },
    { icon: LogOut, label: "Sign out" },
  ];

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/70 backdrop-blur-md border-2 border-white/50 p-2 rounded-lg text-slate-600 hover:bg-white/90"
      >
        {isCollapsed ? (
          <Menu className="w-5 h-5" />
        ) : (
          <X className="w-5 h-5" />
        )}
      </button>

      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 transition-all duration-300 ${isCollapsed
          ? "-translate-x-full lg:translate-x-0 lg:w-20"
          : "translate-x-0 w-80 lg:w-80"
          }`}
      >
        <div className="h-full bg-white/30 backdrop-blur-xl border-r-2 border-white/50 p-6 flex flex-col shadow-xl">
          {/* Toggle Button for Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block absolute top-6 -right-3 bg-[#D78B30] text-white p-1.5 rounded-full hover:bg-[#C4661F] transition-colors shadow-lg"
          >
            {isCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>

          {/* User Profile */}
          <div className="mb-7">
            <div
              className={`flex items-center gap-3 mb-6 ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="relative">
                <img
                  src={userProfilePicture}
                  alt={userName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D78B30]"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D78B30] rounded-full border-2 border-white"></div>
              </div>
              {!isCollapsed && (
                <div>
                  <div className="text-sm text-slate-600">
                    Welcome,
                  </div>
                  <div className="text-slate-900">
                    {userName}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="mb-6">
              {!isCollapsed && (
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-3 px-3">
                  MENU
                </div>
              )}
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        onPageChange(item.label);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                        ? "bg-white/70 text-slate-900 shadow-sm border-2 border-[#D78B30]"
                        : "text-slate-600 hover:bg-white/50 border-2 border-transparent"
                        } ${isCollapsed ? "justify-center" : ""}`}
                      title={isCollapsed ? item.label : ""}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#D78B30]" : "text-slate-400 group-hover:text-[#D78B30]"}`}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left text-sm">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="bg-[#D78B30] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings Section */}
            <div className="mb-6">
              {!isCollapsed && (
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-3 px-3">
                  SETTINGS
                </div>
              )}
              <div className="space-y-1">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const isSignOut = item.label === "Sign out";
                  return (
                    <button
                      key={item.label}
                      onClick={isSignOut ? onLogout : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-slate-600 hover:bg-white/50 border-2 border-transparent ${isCollapsed ? "justify-center" : ""
                        }`}
                      title={isCollapsed ? item.label : ""}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-[#D78B30]" />
                      {!isCollapsed && (
                        <span className="flex-1 text-left text-sm">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Section - Account Items (shown only when collapsed) */}
          {/* {isCollapsed && (
            <div className="border-t border-white/50 pt-4">
              <div className="space-y-1">
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  const isSignOut = item.label === 'Sign out';
                  return (
                    <button
                      key={item.label}
                      onClick={isSignOut ? onLogout : undefined}
                      className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-slate-600 hover:bg-white/50 border-2 border-transparent"
                      title={item.label}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-[#D78B30]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* Company Branding */}
          {!isCollapsed && (
            <div className="border-t border-white/50 pt-4 mt-auto">
              <div className="text-center">
                <div className="text-sm text-slate-900 mb-1">
                  THE L-IT
                </div>
                <div className="text-xs text-slate-500">
                  Piercings & Tattoos
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        ></div>
      )}
    </>
  );
}