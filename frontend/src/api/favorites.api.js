import axiosClient from './axiosClient';

const favoritesApi = {
  // Lấy danh sách yêu thích
  getFavorites() {
    // Mock tạm thời vì backend chưa có API
    return Promise.resolve({ EC: 0, EM: "Mock", DT: [] });
    // return axiosClient.get('/favorites');
  },

  // Thêm vào yêu thích
  addFavorite(recipeId, data = {}) {
    return Promise.resolve({ EC: 0, EM: "Mock", DT: { recipeId } });
    // return axiosClient.post(`/favorites/${recipeId}`, data);
  },

  // Sửa ghi chú
  updateFavoriteNote(recipeId, data) {
    return Promise.resolve({ EC: 0, EM: "Mock", DT: { recipeId } });
    // return axiosClient.put(`/favorites/${recipeId}`, data);
  },

  // Bỏ yêu thích
  removeFavorite(recipeId) {
    return Promise.resolve({ EC: 0, EM: "Mock", DT: { recipeId } });
    // return axiosClient.delete(`/favorites/${recipeId}`);
  }
};

export default favoritesApi;
