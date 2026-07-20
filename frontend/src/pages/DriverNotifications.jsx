import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import api from '../services/api';

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function DriverNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('driver_dismissed_notifications') || '[]'));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const masterSwitch = localStorage.getItem('masterNotifications');
    if (masterSwitch !== null) {
      setNotificationsEnabled(masterSwitch === 'true');
    }
  }, []);

  useEffect(() => {
    api
      .get('/notifications/my')
      .then(({ data }) => {
        setAlerts(data.notifications || []);
        setError('');
      })
      .catch(() => setError('Could not load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a._id));

  const handleMarkAsRead = (id) => {
    const next = new Set(dismissedIds);
    next.add(id);
    setDismissedIds(next);
    localStorage.setItem('driver_dismissed_notifications', JSON.stringify([...next]));
  };

  return (
    <DashboardLayout
      title="Driver Alerts"
      subtitle="Live updates on your active loads and dispatch assignments."
    >
      <div className="max-w-4xl pb-10">
        {!notificationsEnabled ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-3 text-amber-700 font-bold text-lg">⚠️</div>
            <h3 className="text-md font-bold text-amber-900 mb-1">Notifications are Muted</h3>
            <p className="text-xs text-amber-700 max-w-sm mx-auto">
              You have turned off alerts in your Settings.
            </p>
          </div>
        ) : loading ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-gray-500 text-sm">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center text-red-600 text-sm">
            {error}
          </div>
        ) : visibleAlerts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 mb-3 text-gray-500 font-bold text-xl">🎉</div>
            <h3 className="text-md font-bold text-[#133C2C] mb-1">All caught up!</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You have read all your driver notifications.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleAlerts.map((notif) => (
              <div key={notif._id} className="p-4 rounded-xl border bg-white shadow-sm flex items-start gap-4 border-l-4 border-l-blue-600 transition-all duration-300 hover:shadow-md">
                <div className="p-2 rounded-lg text-xs font-bold mt-0.5 bg-blue-50 text-blue-700">🚚</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-[#133C2C] flex items-center gap-2">
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-400 font-medium">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{notif.message}</p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as read
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}