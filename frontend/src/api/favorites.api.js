import axiosClient from './axiosClient';

const favoritesApi = {
  // Lấy danh sách yêu thích
  getFavorites() {
    return axiosClient.get('/favorites');
  },

  // Thêm vào yêu thích
  addFavorite(recipeId, data = {}) {
    // data: { personalNotes } (optional)
    return axiosClient.post(`/favorites/${recipeId}`, data);
  },

  // Sửa ghi chú
  updateFavoriteNote(recipeId, data) {
    // data: { personalNotes }
    return axiosClient.put(`/favorites/${recipeId}`, data);
  },

  // Bỏ yêu thích
  removeFavorite(recipeId) {
    return axiosClient.delete(`/favorites/${recipeId}`);
  }
};

export default favoritesApi;
