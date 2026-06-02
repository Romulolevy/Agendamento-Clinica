"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { NotificationService } from "../services/NotificationService";
import { Notification, NotificationJSON } from "../models/Notification";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  notifications: NotificationJSON[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationJSON[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const notificationService = NotificationService.getInstance();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const allNotifications = await notificationService.getRecent(50, user?.id);
      setNotifications(allNotifications.map((n) => n.toJSON()));

      const count = await notificationService.countUnread(user?.id);
      setUnreadCount(count);
    } finally {
      setIsLoading(false);
    }
  }, [notificationService, user?.id]);

  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user, refresh]);

  const markAsRead = useCallback(
    async (id: string) => {
      await notificationService.markAsRead(id);
      await refresh();
    },
    [notificationService, refresh]
  );

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead(user?.id);
    await refresh();
  }, [notificationService, user?.id, refresh]);

  const addNotification = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => [notification.toJSON(), ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refresh,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications deve ser usado dentro de um NotificationProvider"
    );
  }
  return context;
}
