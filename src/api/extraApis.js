import client from './client';

export const paymentApi = {
  processPayment: (paymentData) => client.post('/payments', paymentData),
  getPaymentByBookingId: (bookingId) => client.get(`/payments/booking/${bookingId}`)
};

export const reviewApi = {
  createReview: (reviewData) => client.post('/reviews', reviewData),
  getWorkerReviews: (workerId) => client.get(`/reviews/worker/${workerId}`)
};

export const notificationApi = {
  getNotifications: () => client.get('/notifications'),
  markAsRead: (id) => client.put(`/notifications/${id}/read`),
  markAllAsRead: () => client.put('/notifications/read-all')
};

export const adminApi = {
  getStats: () => client.get('/admin/stats'),
  getUsers: (role) => client.get('/admin/users', { params: { role } }),
  toggleUserStatus: (userId) => client.put(`/admin/users/${userId}/toggle-status`),
  verifyWorker: (workerId, status, notes) => client.put(`/admin/workers/${workerId}/verify`, { status, notes }),
  getAllBookings: (status) => client.get('/admin/bookings', { params: { status } }),
  deleteReview: (reviewId) => client.delete(`/admin/reviews/${reviewId}`)
};
