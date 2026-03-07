import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hexagon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAppState } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.auth.register(email, username, password);
      } else {
        await api.auth.login(email, password);
      }
      await checkAppState();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white" dir="rtl">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg mb-4"
          >
            <Hexagon className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            BOQ<span className="text-amber-600">Pro</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {isRegister ? 'CREATE ACCOUNT' : 'ENGINEERING LOGIN'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-400 tracking-wide">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                dir="ltr"
                className="h-11 bg-slate-50 border-slate-200 text-slate-800 rounded placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-500/20"
              />
            </div>

            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <Label htmlFor="username" className="text-xs font-medium text-slate-400 tracking-wide">שם משתמש</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  dir="ltr"
                  className="h-11 bg-slate-50 border-slate-200 text-slate-800 rounded placeholder:text-slate-400"
                />
              </motion.div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-slate-400 tracking-wide">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                dir="ltr"
                className="h-11 bg-slate-50 border-slate-200 text-slate-800 rounded placeholder:text-slate-400"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-rose-600 bg-rose-50 border border-rose-500/20 p-3 rounded"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 text-sm rounded-md transition-all w-full h-11 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'מתחבר...' : isRegister ? 'הרשמה' : 'התחברות'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] text-slate-600 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>או</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <button
            type="button"
            className="w-full text-sm text-slate-400 hover:text-amber-600 transition-colors py-2"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-600 mt-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          כתב כמויות אוטומטי מתכניות בניה
        </p>
      </motion.div>
    </div>
  );
}
