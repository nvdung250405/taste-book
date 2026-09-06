import axiosClient from './axiosClient';

const usersApi = {
  // Lấy danh sách người dùng (Admin)
  getUsers(params) {
    // params: { keyword, role }
    return axiosClient.get('/admin/users', { params });
  },

  // Chi tiết người dùng (Admin)
  getUserById(userId) {
    return axiosClient.get(`/admin/users/${userId}`);
  },
};

export default usersApi;
