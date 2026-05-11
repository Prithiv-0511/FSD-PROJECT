import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';
import api from '../../api/axios';

export default function Header() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=10');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(ns => ns.map(n => ({ ...n, status: 'read' })));
    } catch {}
  };

  return (
    <header style={{
      position: 'fixed', top: 0, right: 0,
      left: 'var(--sidebar-width)',
      height: 'var(--header-height)',
      background: 'rgba(10, 14, 26, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 40,
      transition: 'left var(--transition-base)',
    }} id="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {user?.organization?.name || 'AnnounceHub'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowPanel(!showPanel)}
            style={{ position: 'relative' }}
            id="notification-bell"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--danger-500)', color: 'white',
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showPanel && (
            <div className="notification-panel">
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderBottom: '1px solid var(--border-primary)',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }}>
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notification-item ${n.status !== 'read' ? 'unread' : ''}`}
                  >
                    {n.status !== 'read' && <div className="notification-dot" />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {n.message?.substring(0, 80)}{n.message?.length > 80 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
        }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      </div>
    </header>
  );
}
