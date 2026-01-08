import React, { useState } from "react";
import { AccountCard } from "./components/AccountCard";
import { LoginForm } from "./components/LoginForm";
import { PasswordModal } from "./components/PasswordModal";
import { Dashboard } from "./components/Dashboard";
import { Checkout } from "./components/Checkout";
import { Transactions } from "./components/Transactions";
import { Inventory } from "./components/Inventory";
import { Sidebar } from "./components/Sidebar";
import { Trash2 } from "lucide-react";
import logo from "figma:asset/9a588303adbb1fdb50d30917cd5d81adce6d930a.png";
import { api, Account } from "./api";
import { useEffect } from "react";

export default function App() {
  const [showNewLogin, setShowNewLogin] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);
  const [accounts, setAccounts] =
    useState<Account[]>(api.getCachedAccounts());
  const [removeMode, setRemoveMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [currentPage, setCurrentPage] = useState("Dashboard");

  useEffect(() => {
    // We don't fetch all accounts from API for the selection screen anymore
    // to support shared-device privacy/security. We only show CACHED accounts.
    setAccounts(api.getCachedAccounts());
  }, []);

  const handleAccountSelect = (account: Account) => {
    // Show the password modal instead of directly logging in
    setSelectedAccount(account);
  };

  const handleRemoveAccount = (accountId: string | number) => {
    api.removeFromCache(accountId);
    setAccounts(api.getCachedAccounts());
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedAccount) return;
    try {
      const data = await api.login(selectedAccount.username, password);
      // Backend now returns the full Account object in data.user
      const fullUser = data.user;
      api.cacheAccount(fullUser);
      setIsAuthenticated(true);
      setCurrentUser(fullUser);
      setSelectedAccount(null);
      setAccounts(api.getCachedAccounts());

      // Role-based redirection
      if (fullUser.role === 'CASHIER') {
        setCurrentPage('Checkout');
      } else {
        setCurrentPage('Dashboard');
      }
    } catch (error: any) {
      alert(error.message || "Invalid password");
    }
  };

  const handleFullLogin = async (username: string, password: string) => {
    try {
      const data = await api.login(username, password);
      const fullUser = data.user;
      api.cacheAccount(fullUser);
      setIsAuthenticated(true);
      setCurrentUser(fullUser);
      setShowNewLogin(false);
      setAccounts(api.getCachedAccounts());

      // Role-based redirection
      if (fullUser.role === 'CASHIER') {
        setCurrentPage('Checkout');
      } else {
        setCurrentPage('Dashboard');
      }
    } catch (error: any) {
      alert(error.message || "Invalid credentials");
      throw error;
    }
  };

  const handleModalClose = () => {
    setSelectedAccount(null);
  };

  const handleLogout = () => {
    api.clearSession();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('Dashboard'); // Reset default
  };

  // If authenticated, show dashboard
  if (isAuthenticated && currentUser) {
    // Basic protection against unauthorized view access
    // If a Cashier tries to access Dashboard/Inventory/etc, reroute them or show nothing
    const authorizedPages = ['Checkout', 'Transactions', 'Edit Profile', 'Edit Payment Details', 'Settings', 'Sign out'];
    // For Admin/Manager, all pages are allowed.
    // We only restrict if role is CASHIER and page is NOT in authorized list.
    if (currentUser.role === 'CASHIER' && !authorizedPages.includes(currentPage)) {
      // Force redirect to Checkout if they somehow got here
      // In a real router we'd redirect, here we just render checkout or return null to trigger state change next render? 
      // Better to just render Checkout if state is invalid, or fix state. 
      // Since we are in render, we shouldn't set state. We'll simply act as if page is Checkout.
    }

    // Actually, let's just conditionally render.
    const effectivePage = (currentUser.role === 'CASHIER' && !authorizedPages.includes(currentPage))
      ? 'Checkout'
      : currentPage;

    return (
      <div className="flex h-screen bg-[#f5f5f5]">
        <Sidebar
          userName={currentUser.name}
          userProfilePicture={currentUser.profilePicture}
          userRole={currentUser.role}
          onLogout={handleLogout}
          currentPage={effectivePage}
          onPageChange={setCurrentPage}
        />
        {effectivePage === "Dashboard" && (
          <Dashboard
            userName={currentUser.name}
            userProfilePicture={currentUser.profilePicture}
          />
        )}
        {effectivePage === "Checkout" && (
          <Checkout
            userName={currentUser.name}
            userProfilePicture={currentUser.profilePicture}
          />
        )}
        {effectivePage === "Transactions" && (
          <Transactions
            userName={currentUser.name}
            userProfilePicture={currentUser.profilePicture}
          />
        )}
        {effectivePage === "Inventory" && (
          <Inventory
            userName={currentUser.name}
            userProfilePicture={currentUser.profilePicture}
          />
        )}
      </div>
    );
  }

  // Otherwise, show login screen
  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Logo */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-30"
        style={{ backgroundImage: `url(${logo})` }}
      ></div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12 relative">
          <h1 className="text-slate-800 mb-2">
            Point of Sale Login
          </h1>
          <p className="text-slate-600">
            Select your account to continue your shift
          </p>

          {/* Remove Mode Toggle Button - Top Right */}
          {!showNewLogin && (
            <button
              onClick={() => setRemoveMode(!removeMode)}
              className={`absolute top-0 -right-50 p-3 rounded-lg transition-colors cursor-pointer ${removeMode
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/70 backdrop-blur-md border-2 border-white/50 text-slate-600 hover:bg-white/90"
                }`}
              title={
                removeMode ? "Done removing" : "Remove accounts"
              }
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {!showNewLogin ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {accounts.map((account: Account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onSelect={() => handleAccountSelect(account)}
                  onRemove={() =>
                    handleRemoveAccount(account.id)
                  }
                  removeMode={removeMode}
                />
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowNewLogin(true)}
                className="bg-[#ffffff] border-2 border-[#D78B30] text-slate-700 px-6 py-3 rounded-lg hover:bg-[#D78B30] transition-colors"
              >
                Use a different account
              </button>
            </div>
          </>
        ) : (
          <div className="max-w-md mx-auto">
            <LoginForm
              onBack={() => setShowNewLogin(false)}
              onSubmit={handleFullLogin}
            />
          </div>
        )}
      </div>

      {/* Password Modal */}
      {selectedAccount && (
        <PasswordModal
          account={selectedAccount}
          onClose={handleModalClose}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
}