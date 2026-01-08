import React, { useState } from 'react';
import { ArrowLeft, User, Lock } from 'lucide-react';

interface LoginFormProps {
  onBack: () => void;
  onSubmit: (username: string, password: string) => Promise<void>;
}

export function LoginForm({ onBack, onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(username, password);
    } catch (error: any) {
      // Error handled by parent usually, but we could add local feedback too
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl p-8 shadow-sm border-2 border-white/50">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to accounts</span>
      </button>

      <h2 className="text-slate-800 mb-6">Sign in with a different account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-slate-700 mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D78B30] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D78B30] text-white py-3 rounded-lg hover:bg-[#C4661F] transition-colors mt-6 disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <a href="#" className="text-[#D78B30] hover:text-[#C4661F] text-sm">
          Forgot password?
        </a>
      </div>
    </div>
  );
}