import axiosClient from './axiosClient';

const favoritesApi = {
  // Lấy danh sách yêu thích từ database backend
  getFavorites() {
    return axiosClient.get('/favorites');
  },

  // Thêm vào yêu thích (lưu trực tiếp vào database)
  addFavorite(recipeId, data = {}) {
    return axiosClient.post(`/favorites/${recipeId}`, data);
  },

  // Cập nhật ghi chú cá nhân trong database
  updateFavoriteNote(recipeId, data = {}) {
    return axiosClient.put(`/favorites/${recipeId}`, data);
  },

  // Bỏ yêu thích khỏi database
  removeFavorite(recipeId) {
    return axiosClient.delete(`/favorites/${recipeId}`);
  },
};

export default favoritesApi;
