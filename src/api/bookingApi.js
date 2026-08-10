import client from './client';

export const bookingApi = {
  createBooking: (bookingData) => client.post('/bookings', bookingData),
  getCustomerBookings: (status) => client.get('/bookings/customer', { params: { status } }),
  getWorkerBookings: (status) => client.get('/bookings/worker', { params: { status } }),
  getBookingById: (id) => client.get(`/bookings/${id}`),
  respondToBooking: (id, action, reason) => client.put(`/bookings/${id}/respond`, { action, reason }),
  startService: (id) => client.put(`/bookings/${id}/start`),
  completeService: (id, hoursWorked) => client.put(`/bookings/${id}/complete`, { hoursWorked }),
  cancelBooking: (id, reason) => client.put(`/bookings/${id}/cancel`, { reason })
};
