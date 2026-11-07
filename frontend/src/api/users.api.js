import axiosClient from './axiosClient';

const usersApi = {
  // Lấy danh sách người dùng (Admin)
  getUsers(params, options = {}) {
    // params: { keyword, role, page, limit }
    return axiosClient.get('/admin/users', { ...options, params });
  },

  // Chi tiết người dùng (Admin)
  getUserById(userId, options = {}) {
    return axiosClient.get(`/admin/users/${userId}`, options);
  },
};

export default usersApi;
