import { createContext, useState, useEffect } from "react";
import NotificationAPI from "api/NotificationAPI";

export const NotificationContext = createContext(null); // ✅ สร้าง Context

export const NotificationProvider = ({ children }) => {
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await NotificationAPI.getNotifMiniAll();
        if (response.isCompleted) {
          setHasNewNotification(response.data.newAdded > 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications(); // โหลดตอนเริ่มต้น
    const interval = setInterval(fetchNotifications, 30000); // รีเฟรชทุก 30 วินาที

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={hasNewNotification}>
      {children}
    </NotificationContext.Provider>
  );
};
