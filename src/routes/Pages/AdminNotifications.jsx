import { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../components/Config";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin-notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNotifications(response.data.notifications);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markSingleAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin-notifications/mark-single-as-read/${notificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI instantly
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="card">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      <div className="bg-[#f8f9fa] shadow-sm dark:bg-slate-900 p-6 rounded-lg ">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => markSingleAsRead(notification._id)}
              className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <p className="font-semibold">{notification.message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
              {!notification.isRead && (
                <span className="text-red-500 text-sm">Unread</span>
              )}
            </div>
          ))
        ) : (
          <p>No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;


