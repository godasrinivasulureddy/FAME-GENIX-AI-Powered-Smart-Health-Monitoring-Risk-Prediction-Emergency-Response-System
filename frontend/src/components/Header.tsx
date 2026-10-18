import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Stethoscope, 
  Truck, 
  Lock, 
  Bell, 
  BellOff,
  User as UserIcon, 
  LogOut, 
  Radio, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Role, User, NotificationItem } from '../types';
import { api } from '../services/api';

interface HeaderProps {
  currentUser: User | null;
  activeRole: Role;
  onRoleChange: (role: Role) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickLogin: (email: string) => void;
  onNavigateLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeRole,
  onRoleChange,
  onOpenAuth,
  onLogout,
  onQuickLogin,
  onNavigateLanding,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fame_notifs_enabled') === 'true';
  });

  const toggleNotifications = () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    localStorage.setItem('fame_notifs_enabled', String(nextState));
    if (!nextState) {
      setNotifications([]);
      setUnreadCount(0);
    } else {
      fetchNotifs();
    }
  };

  const fetchNotifs = async () => {
    if (!currentUser || !notificationsEnabled) return;
    try {
      const [list, countRes] = await Promise.all([
        api.getNotifications(),
        api.getUnreadNotificationCount(),
      ]);
      setNotifications(list.slice(0, 8));
      setUnreadCount(countRes.unread_count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!notificationsEnabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 4000);
    return () => clearInterval(interval);
  }, [currentUser, notificationsEnabled]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifs();
    } catch {
      // ignore
    }
  };

  const rolesConfig: Array<{ role: string; label: string; icon: any; color: string }> = [
    { role: 'PATIENT', label: 'Patient Portal', icon: Activity, color: 'text-cyan-400' },
    { role: 'DOCTOR', label: 'Doctor CDS', icon: Stethoscope, color: 'text-emerald-400' },
    { role: 'EMERGENCY_OPERATOR', label: 'Emergency Ops', icon: ShieldAlert, color: 'text-rose-400' },
    { role: 'AMBULANCE_TEAM', label: 'Ambulance Unit', icon: Truck, color: 'text-amber-400' },
    { role: 'SYSTEM_ADMIN', label: 'Admin Portal', icon: ShieldAlert, color: 'text-purple-400' },
    { role: 'ADMIN', label: 'Admin Portal', icon: ShieldAlert, color: 'text-purple-400' },
  ];
  const activeRoleConfig = rolesConfig.find((r) => r.role === activeRole) || rolesConfig[0];
  const ActiveIcon = activeRoleConfig.icon;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Active Portal Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30 flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-xl tracking-wider text-white whitespace-nowrap">
                FAME-GENIX
              </span>
              {/* Single Active Portal Badge */}
              {activeRoleConfig && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5 whitespace-nowrap ${activeRoleConfig.color}`}>
                  <ActiveIcon className="w-3.5 h-3.5" />
                  <span>{activeRoleConfig.label}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Actions & User Profile */}
          <div className="flex items-center gap-3">
            {/* Landing Page Button */}
            <button
              onClick={onNavigateLanding}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all hidden sm:flex items-center gap-1.5"
            >
              <span>Landing Page</span>
            </button>

            {/* Notification Master ON / OFF Toggle Button */}
            <button
              onClick={toggleNotifications}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                notificationsEnabled
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title={notificationsEnabled ? 'Click to Turn OFF Notifications' : 'Click to Turn ON Notifications'}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] hidden md:inline">Notifications ON</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] hidden md:inline">Notifications OFF</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications-toggle"
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2 rounded-lg border transition-colors ${
                  notificationsEnabled
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'
                    : 'bg-slate-950/90 text-slate-500 border-slate-800 opacity-60'
                }`}
                title={notificationsEnabled ? 'View System Notifications' : 'Notifications are Turned OFF'}
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4 text-slate-500" />}
                {notificationsEnabled && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className={`w-4 h-4 ${notificationsEnabled ? 'text-cyan-400 animate-ping' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold text-white">Event Broadcast Feed</span>
                    </div>
                    <button
                      onClick={toggleNotifications}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${
                        notificationsEnabled
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {notificationsEnabled ? 'Turn OFF' : 'Turn ON'}
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No recent notifications</div>
                    ) : (
                      notifications.map((n) => {
                        let parsed = {};
                        try {
                          parsed = JSON.parse(n.payload || '{}');
                        } catch {}
                        const isRead = !!n.read_at;

                        return (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors ${
                              isRead ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-800/60 text-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                                {n.type.includes('EMERGENCY') ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                <span>{n.type}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-300 line-clamp-2">
                              {JSON.stringify(parsed)}
                            </p>
                            {!isRead && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                className="mt-2 text-[10px] text-cyan-400 hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Button / Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white">{currentUser.email.split('@')[0]}</div>
                  <div className="text-[10px] font-mono text-cyan-400">{currentUser.role}</div>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-auth"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-600/20"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
