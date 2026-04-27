// src/services/notificationService.js
import axios from '../config/axios';

const BASE = '/notifications';

export const notificationService = {
  // GET /api/notifications → { data: { notifications: [], total_unread: N } }
  getAll: () => axios.get(BASE),

  // PATCH /api/notifications/:id/read
  markAsRead: (id) => axios.patch(`${BASE}/${id}/read`),

  // PATCH /api/notifications/read-all
  markAllAsRead: () => axios.patch(`${BASE}/read-all`),

  // DELETE /api/notifications/:id
  delete: (id) => axios.delete(`${BASE}/${id}`),

  // DELETE /api/notifications/clear
  deleteAll: () => axios.delete(`${BASE}/clear`),
};