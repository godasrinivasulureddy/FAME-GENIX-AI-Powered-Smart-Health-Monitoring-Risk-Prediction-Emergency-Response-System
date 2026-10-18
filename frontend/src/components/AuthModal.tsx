import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Role } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('FameGenix#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('PATIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.register({
          email,
          password,
          full_name: fullName || 'New User',
          role,
        });
      } else {
        await api.login(email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePreset = async (profileEmail: string) => {
    setEmail(profileEmail);
    setPassword('FameGenix#2026');
    setError('');
    setLoading(true);
    try {
      await api.login(profileEmail, 'FameGenix#2026');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const roleProfiles = [
    { email: 'patient@famegenix.org', role: 'PATIENT', label: 'Patient Profile', badge: 'Vitals & Symptoms' },
    { email: 'doctor@famegenix.org', role: 'DOCTOR', label: 'Dr. Sarah Jenkins', badge: 'Clinical Queue & Review' },
    { email: 'emergency@famegenix.org', role: 'EMERGENCY_OPERATOR', label: 'Emergency Ops', badge: 'Verify & Dispatch' },
    { email: 'ambulance@famegenix.org', role: 'AMBULANCE_TEAM', label: 'Ambulance Unit 01', badge: 'Transit & Handoff' },
    { email: 'admin@famegenix.org', role: 'SYSTEM_ADMIN', label: 'System Admin', badge: 'Audit Logs & ML' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {isRegister ? 'Create FAME-GENIX Account' : 'Sign in to FAME-GENIX'}
              </h3>
              <p className="text-xs text-slate-400">AI Risk & Emergency Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Authorized Access Profiles Dropdown */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authorized Access Profiles</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 w-4 h-4 text-cyan-400 pointer-events-none" />
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleProfilePreset(e.target.value);
                  }
                }}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-500 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer font-medium"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Select Profile...</option>
                <option value="patient@famegenix.org" className="bg-slate-900 text-white">Patient</option>
                <option value="doctor@famegenix.org" className="bg-slate-900 text-white">Doctor</option>
                <option value="emergency@famegenix.org" className="bg-slate-900 text-white">Emergency</option>
                <option value="ambulance@famegenix.org" className="bg-slate-900 text-white">Ambulance</option>
                <option value="admin@famegenix.org" className="bg-slate-900 text-white">System Admin</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Select any profile from the dropdown to sign in instantly.
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase">Or custom login</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="PATIENT">PATIENT</option>
                      <option value="DOCTOR">DOCTOR</option>
                      <option value="EMERGENCY_OPERATOR">EMERGENCY_OPERATOR</option>
                      <option value="AMBULANCE_TEAM">AMBULANCE_TEAM</option>
                      <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-cyan-400 transition-colors"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all"
            >
              {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
