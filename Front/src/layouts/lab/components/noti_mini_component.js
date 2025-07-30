import React, { useState, useEffect } from "react";
import { Badge } from "@mui/material";
import Icon from "@mui/material/Icon";
import NotificationAPI from "api/NotificationAPI";

const NotificationIcon = () => {
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

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // รีเฟรชทุก 30 วินาที

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge color="error" variant="dot" invisible={!hasNewNotification}>
      <Icon fontSize="medium">notifications</Icon>
    </Badge>
  );
};

export default NotificationIcon;
