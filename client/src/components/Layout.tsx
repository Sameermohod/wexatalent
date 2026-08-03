import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Network, 
  Users, 
  Building2, 
  Briefcase, 
  LayoutDashboard, 
  Bookmark, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Developers', href: '/developers', icon: Users },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Network Explorer', href: '/network-explorer', icon: Compass },
  ];

  if (token) {
    navigation.push({ name: 'My Bookmarks', href: '/bookmarks', icon: Bookmark });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0 md:flex-col w-64 border-r border-border bg-card">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/10 text-primary">
              <Network size={24} className="animate-pulse" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
              Wexa Talent
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 gap-3 ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section (Footer of Sidebar) */}
          <div className="p-4 border-t border-border bg-slate-900/20">
            {user ? (
              <div className="flex items-center justify-between">
                <Link to={`/developers/${user.id}`} className="flex items-center gap-3 group">
                  <img
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 group-hover:border-primary transition-colors"
                    src={user.avatarUrl}
                    alt={user.name}
                  />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-sm font-semibold text-slate-200 truncate group-hover:text-primary transition-colors">{user.name}</span>
                    <span className="text-xs text-slate-400 truncate">My Profile</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all gap-2"
                >
                  <LogIn size={16} />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-lg shadow-indigo-600/15 gap-2"
                >
                  <UserPlus size={16} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Header for Mobile/Title */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/60 backdrop-blur-md z-10 md:justify-end">
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <Menu size={24} />
            </button>
            <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
              Wexa Talent
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-primary border border-indigo-500/20">
              ⚡ CognoDB Graph Enabled
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6 bg-background">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative flex flex-col flex-1 w-full max-w-xs bg-card border-r border-border">
            <div className="absolute top-0 right-0 p-1 pt-4 -mr-12">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="flex items-center h-16 px-6 border-b border-border gap-2">
              <Network size={24} className="text-primary animate-pulse" />
              <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
                Wexa Talent
              </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all gap-3 ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/developers/${user.id}`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <img
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      src={user.avatarUrl}
                      alt={user.name}
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-slate-200 truncate">{user.name}</span>
                      <span className="text-xs text-slate-400 truncate">My Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-xl border border-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
