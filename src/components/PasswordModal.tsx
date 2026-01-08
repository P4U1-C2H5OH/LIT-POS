import React, { useState, useEffect, useRef } from 'react';
import { Lock, X } from 'lucide-react';

import { Account } from '../api';

interface PasswordModalProps {
  account: Account;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

export function PasswordModal({ account, onClose, onSubmit }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the password input when modal opens
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md animate-in border-2 border-white/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-slate-800">Enter Password</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
            <img
              src={account.profilePicture}
              alt={account.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-900 truncate">{account.name}</h3>
              <p className="text-slate-500 text-sm truncate">{account.email}</p>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D78B30] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[rgb(215,139,48)] text-white rounded-lg hover:bg-[#C4661F] transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}