import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import TruckLoader from "../../components/common/TruckLoader";
import api from "../../services/api";

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [readIds, setReadIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("buyer_read_notifications") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/notifications/my")
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setError("");
      })
      .catch(() => setError("Could not load notifications."))
      .finally(() => setLoading(false));
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.message.toLowerCase().includes(search.toLowerCase())
      )
      .map((item) => ({ ...item, read: readIds.has(item._id) }));
  }, [notifications, search, readIds]);

  const persistReadIds = (next) => {
    setReadIds(next);
    localStorage.setItem("buyer_read_notifications", JSON.stringify([...next]));
  };

  const markAllAsRead = () => {
    persistReadIds(new Set(notifications.map((n) => n._id)));
  };

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Stay updated with your shipments and payments."
    >
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:w-96 rounded-lg border border-primary/10 px-4 py-3"
          />

          <button
            onClick={markAllAsRead}
            className="rounded-lg bg-primary px-5 py-3 text-white transition hover:opacity-90"
          >
            Mark All as Read
          </button>
        </div>

        {loading ? (
          <TruckLoader fullScreen={false} />
        ) : error ? (
          <div className="rounded-xl border border-danger/20 bg-white p-12 text-center text-danger">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-xl border p-6 shadow-sm transition ${
                  notification.read ? "border-primary/10 bg-white" : "border-primary bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-primary">{notification.title}</h3>
                    <p className="mt-2 text-[#5B7A70]">{notification.message}</p>
                    <p className="mt-3 text-xs text-[#5B7A70]">{timeAgo(notification.createdAt)}</p>
                  </div>

                  {!notification.read && <span className="h-3 w-3 rounded-full bg-primary"></span>}
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="rounded-xl border border-primary/10 bg-white p-12 text-center">
                <h3 className="text-lg font-semibold text-primary">No Notifications Found</h3>
                <p className="mt-2 text-[#5B7A70]">There are no notifications matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}