import axiosClient from './axiosClient';

const authApi = {
  // Đăng ký tài khoản
  register(data) {
    return axiosClient.post('/auth/register', data);
  },

  // Đăng nhập
  login(data) {
    return axiosClient.post('/auth/login', data);
  },

  // Đăng xuất
  logout() {
    return axiosClient.post('/auth/logout');
  },

  // Quên mật khẩu
  forgotPassword(data) {
    return axiosClient.post('/auth/forgot-password', data);
  },

  // Lấy thông tin cá nhân
  getProfile() {
    return axiosClient.get('/users/me');
  },

  // Cập nhật hồ sơ
  updateProfile(data) {
    return axiosClient.put('/users/me', data);
  },

  // Đổi mật khẩu
  changePassword(data) {
    return axiosClient.put('/users/me/password', data);
  },
};

export default authApi;
