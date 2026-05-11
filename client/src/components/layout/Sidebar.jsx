import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Megaphone, Users, Building2, BarChart3, Settings, LogOut, ChevronLeft, Menu } from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/departments', icon: Building2, label: 'Departments' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const employeeLinks = [
  { to: '/feed', icon: Megaphone, label: 'Announcements' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-primary)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    transition: 'width var(--transition-base), transform var(--transition-base)',
    overflow: 'hidden',
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="btn-icon btn-ghost"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: 14, left: 14, zIndex: 60,
          display: 'none',
        }}
        id="mobile-menu-toggle"
      >
        <Menu size={22} />
      </button>

      <aside style={sidebarStyle} id="app-sidebar">
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 12px' : '20px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid var(--border-primary)',
          minHeight: 'var(--header-height)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0,
          }}>
            A
          </div>
          {!collapsed && (
            <span style={{
              fontSize: '1.15rem', fontWeight: 800,
              background: 'linear-gradient(135deg, var(--primary-400), var(--accent-400))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}>
              AnnounceHub
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 14px' : '11px 16px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary-400)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              })}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: collapsed ? '16px 8px' : '16px',
          borderTop: '1px solid var(--border-primary)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
              }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user?.role}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ flex: 1, justifyContent: collapsed ? 'center' : 'flex-start', fontSize: '0.82rem' }}>
              <LogOut size={18} />
              {!collapsed && 'Logout'}
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="btn btn-ghost btn-icon" style={{ display: 'flex' }}>
              <ChevronLeft size={18} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Adjust main content margin */}
      <style>{`
        .main-content { margin-left: ${collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'} !important; }
        @media (max-width: 768px) {
          #app-sidebar { transform: translateX(${mobileOpen ? '0' : '-100%'}); width: var(--sidebar-width) !important; }
          .main-content { margin-left: 0 !important; }
          #mobile-menu-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
