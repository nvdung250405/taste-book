import axiosClient from './axiosClient';

const categoriesApi = {
  // --- PUBLIC & USER CATEGORIES ---
  
  // Lấy danh mục hiển thị (kết hợp chuẩn + cá nhân nếu có token)
  getCategories() {
    return axiosClient.get('/categories');
  },

  // Tạo danh mục cá nhân
  createCategory(data) {
    return axiosClient.post('/categories', data);
  },

  // Sửa danh mục cá nhân
  updateCategory(categoryId, data) {
    return axiosClient.put(`/categories/${categoryId}`, data);
  },

  // Xóa danh mục cá nhân
  deleteCategory(categoryId) {
    return axiosClient.delete(`/categories/${categoryId}`);
  },

  // --- ADMIN CATEGORIES ---
  
  // Lấy danh sách danh mục chuẩn
  getAdminCategories() {
    return axiosClient.get('/admin/categories');
  },

  // Tạo danh mục chuẩn
  createAdminCategory(data) {
    return axiosClient.post('/admin/categories', data);
  },

  // Sửa danh mục chuẩn
  updateAdminCategory(categoryId, data) {
    return axiosClient.put(`/admin/categories/${categoryId}`, data);
  },

  // Xóa danh mục chuẩn
  deleteAdminCategory(categoryId) {
    return axiosClient.delete(`/admin/categories/${categoryId}`);
  }
};

export default categoriesApi;
