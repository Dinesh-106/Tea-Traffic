import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coffee, Lock, Mail, UserCircle2, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('OrderStaff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staticCode, setStaticCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        role,
        ...(role !== 'OrderStaff' && { staticCode })
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('email', response.data.email);

        switch (response.data.role) {
          case 'OrderStaff':
            navigate('/order');
            break;
          case 'Chef':
            navigate('/chef');
            break;
          case 'BillingStaff':
            navigate('/billing');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-orange-100 fade-in">
        <div className="bg-orange-500 p-6 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Coffee size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tea Traffic</h1>
          <p className="text-orange-100 text-sm mt-1">Staff Portal Login</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100">
              <span className="font-semibold block shrink-0 mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Staff Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserCircle2 size={18} />
                </div>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setStaticCode('');
                    setError('');
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm appearance-none"
                >
                  <option value="OrderStaff">Order Staff</option>
                  <option value="Chef">Chef</option>
                  <option value="BillingStaff">Billing Staff</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {(role === 'Chef' || role === 'BillingStaff') && (
              <div className="relative fade-in">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Authorization Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter strictly authorized code"
                    value={staticCode}
                    onChange={(e) => setStaticCode(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="employee@teatraffic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
