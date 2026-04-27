// src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService';

const POLL_INTERVAL = 30_000; // polling tiap 30 detik

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [totalUnread, setTotalUnread]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const timerRef = useRef(null);

  const fetch = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await notificationService.getAll();
      const d   = res.data?.data ?? res.data;
      setNotifications(d?.notifications ?? []);
      setTotalUnread(d?.total_unread ?? 0);
    } catch {
      // silent — jangan tampilkan error saat polling background
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Pertama kali mount + polling
  useEffect(() => {
    fetch(true); // initial load dengan loading indicator

    timerRef.current = setInterval(() => fetch(false), POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetch]);

  const markAsRead = useCallback(async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setTotalUnread(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setTotalUnread(0);
  }, []);

  const remove = useCallback(async (id) => {
    const target = notifications.find(n => n.id === id);
    await notificationService.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (target && !target.read) setTotalUnread(prev => Math.max(0, prev - 1));
  }, [notifications]);

  const clearAll = useCallback(async () => {
    await notificationService.deleteAll();
    setNotifications([]);
    setTotalUnread(0);
  }, []);

  return { notifications, totalUnread, loading, markAsRead, markAllAsRead, remove, clearAll, refetch: fetch };
}