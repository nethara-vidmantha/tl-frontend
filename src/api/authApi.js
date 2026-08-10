import client from './client';

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (userData) => client.post('/auth/register', userData),
  googleLogin: (data) => client.post('/auth/google', data),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) => client.post('/auth/reset-password', { email, otp, newPassword }),
  getProfile: () => client.get('/auth/profile'),
  updateProfile: (data) => client.put('/auth/profile', data)
};
