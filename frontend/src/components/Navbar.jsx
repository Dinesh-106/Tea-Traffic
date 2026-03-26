import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/storage';
import { Coffee, LogOut, Lock, KeyRound, Mail, UserCircle2 } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');

  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState('Chef');
  const [loginStaticCode, setLoginStaticCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/');
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = login({
        role: loginRole,
        staticCode: loginStaticCode
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', response.email);
        setShowLogin(false);
        
        if (response.role === 'Chef') navigate('/chef');
        else if (response.role === 'BillingStaff') navigate('/billing');
        else navigate('/');
      }
    } catch (err) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-orange-500">
          <Coffee size={28} className="stroke-current flex-shrink-0" />
          <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">Tea Traffic</h1>
        </div>
        
        {token ? (
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-white capitalize">{role}</span>
              <span className="text-xs text-gray-400">{email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 md:px-4 md:py-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full md:rounded-lg transition-colors flex items-center gap-2 border border-transparent md:border-red-400/20"
              title="Logout"
            >
              <LogOut size={20} />
              <span className="hidden md:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="relative static sm:relative w-auto">
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="px-3 md:px-4 py-2 bg-brand-orange-500 text-white font-medium rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Lock size={16} /> <span className="hidden sm:inline">Staff Access</span><span className="sm:hidden">Staff</span>
            </button>

            {showLogin && (
              <div className="absolute right-2 sm:right-0 top-[60px] sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-5 fade-in z-[100] max-w-sm">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <h3 className="font-bold flex items-center gap-2 text-white text-sm drop-shadow-md">
                    <Lock size={16} className="text-brand-orange-500" /> Staff Login
                  </h3>
                  <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">

                    <button 
                      onClick={() => { setLoginRole('Chef'); setLoginError(''); setLoginStaticCode(''); }} 
                      type="button"
                      className={`text-[11px] px-2 py-1 rounded-md font-medium transition-colors ${loginRole === 'Chef' ? 'bg-brand-orange-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >Chef</button>
                    <button 
                      onClick={() => { setLoginRole('BillingStaff'); setLoginError(''); setLoginStaticCode(''); }} 
                      type="button"
                      className={`text-[11px] px-2 py-1 rounded-md font-medium transition-colors ${loginRole === 'BillingStaff' ? 'bg-brand-orange-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >Billing</button>
                  </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-3">
                  {loginError && <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20">{loginError}</div>}
                  
                  <div className="relative fade-in">
                    <KeyRound size={14} className="absolute left-3 top-2.5 text-brand-orange-500" />
                    <input 
                      type="password" placeholder="Auth Code" required value={loginStaticCode} onChange={e => setLoginStaticCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-black/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 focus:outline-none placeholder-gray-500 font-medium transition-colors"
                    />
                  </div>

                  <button 
                    type="submit" disabled={isLoggingIn}
                    className="w-full mt-2 bg-gradient-to-r from-brand-orange-500 to-amber-500 text-white font-bold py-2.5 rounded-lg text-sm shadow-[0_4px_15px_rgba(249,115,22,0.4)] hover:shadow-lg disabled:opacity-50 transition-all transform active:scale-95"
                  >
                    {isLoggingIn ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>


              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
