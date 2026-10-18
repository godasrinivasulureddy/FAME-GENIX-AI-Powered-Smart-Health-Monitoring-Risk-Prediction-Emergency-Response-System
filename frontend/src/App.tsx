import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PatientView } from './components/PatientView';
import { DoctorView } from './components/DoctorView';
import { EmergencyView } from './components/EmergencyView';
import { AmbulanceView } from './components/AmbulanceView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { Role, User } from './types';
import { api, getToken } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role>('PATIENT');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  const initAuth = async () => {
    setLoading(true);
    if (getToken()) {
      try {
        const user = await api.getMe();
        setCurrentUser(user);
        setActiveRole(user.role);
      } catch {
        api.logout();
        setCurrentUser(null);
      }
    } else {
      // Auto-login with initial patient profile
      try {
        const res = await api.login('patient@famegenix.org', 'FameGenix#2026');
        setCurrentUser(res.user);
        setActiveRole(res.user.role);
      } catch {
        // fallback
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const handleQuickLogin = async (email: string) => {
    try {
      const res = await api.login(email, 'FameGenix#2026');
      setCurrentUser(res.user);
      setActiveRole(res.user.role);
      setViewMode('app');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setViewMode('landing');
  };

  const handleRoleChange = async (newRole: Role) => {
    // Role access profile quick switch
    const roleEmailMap: Record<Role, string> = {
      PATIENT: 'patient@famegenix.org',
      DOCTOR: 'doctor@famegenix.org',
      EMERGENCY_OPERATOR: 'emergency@famegenix.org',
      AMBULANCE_TEAM: 'ambulance@famegenix.org',
      SYSTEM_ADMIN: 'admin@famegenix.org',
    };
    if (currentUser?.role !== newRole && roleEmailMap[newRole]) {
      setLoading(true);
      try {
        const res = await api.login(roleEmailMap[newRole], 'FameGenix#2026');
        setCurrentUser(res.user);
        setActiveRole(newRole);
        setViewMode('app');
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setActiveRole(newRole);
      setViewMode('app');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-cyan-400">Initializing FAME-GENIX Platform...</span>
        </div>
      </div>
    );
  }

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenAuth={() => setIsAuthOpen(true)}
          onExplorePlatform={(role) => {
            if (role) setActiveRole(role);
            setViewMode('app');
          }}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => {
            initAuth();
            setViewMode('app');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        currentUser={currentUser}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onQuickLogin={handleQuickLogin}
        onNavigateLanding={() => setViewMode('landing')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === 'PATIENT' && <PatientView />}
        {activeRole === 'DOCTOR' && <DoctorView />}
        {activeRole === 'EMERGENCY_OPERATOR' && <EmergencyView />}
        {activeRole === 'AMBULANCE_TEAM' && <AmbulanceView />}
        {activeRole === 'SYSTEM_ADMIN' && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>FAME-GENIX • AI-Powered Smart Health Monitoring, Risk Prediction & Emergency Response System</p>
        <p className="text-[11px] text-slate-600 mt-0.5">AI-Assisted Continuous Health Monitoring & Decision Support Platform • Non-Clinical Simulation</p>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          initAuth();
          setViewMode('app');
        }}
      />
    </div>
  );
}

export default App;
