'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-16 h-16 bg-[#6366f1] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-900/50 text-3xl">
              🏪
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">CLL Carniceria</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Sign in to CLL Scheduler</p>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-1">Welcome back</h2>
          <p className="text-[#94a3b8] text-sm mb-6">Sign in to CLL Scheduler</p>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 flex items-center gap-2">
              <span className="text-red-500">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@store.com"
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-sm text-[#f1f5f9] placeholder-[#475569] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-sm text-[#f1f5f9] placeholder-[#475569] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#334155] text-center">
            <p className="text-xs text-[#475569]">Demo: admin@store.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
