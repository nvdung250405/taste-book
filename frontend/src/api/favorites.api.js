import axiosClient from './axiosClient';

const favoritesApi = {
  // Lấy danh sách yêu thích
  getFavorites() {
    // Mock data vì backend chưa có API
    return Promise.resolve({ EC: 0, DT: [] });
    // return axiosClient.get('/favorites');
  },

  // Thêm vào yêu thích
  addFavorite(recipeId, data = {}) {
    return Promise.resolve({ EC: 0, EM: "Thêm thành công" });
    // return axiosClient.post(`/favorites/${recipeId}`, data);
  },

  // Sửa ghi chú
  updateFavoriteNote(recipeId, data) {
    return Promise.resolve({ EC: 0, EM: "Cập nhật thành công" });
    // return axiosClient.put(`/favorites/${recipeId}`, data);
  },

  // Bỏ yêu thích
  removeFavorite(recipeId) {
    return Promise.resolve({ EC: 0, EM: "Xóa thành công" });
    // return axiosClient.delete(`/favorites/${recipeId}`);
  }
};

export default favoritesApi;
