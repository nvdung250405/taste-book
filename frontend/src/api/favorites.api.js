import axiosClient from './axiosClient';

const favoritesApi = {
  // Lấy danh sách yêu thích từ database backend
  getFavorites(params = {}) {
    return axiosClient.get('/favorites', { params });
  },

  // Thêm vào yêu thích (lưu trực tiếp vào database)
  addFavorite(recipeId, data = {}) {
    const payload =
      typeof data === 'string'
        ? { personalNotes: data }
        : { personalNotes: data?.personalNotes ?? data?.note ?? '', ...data };
    return axiosClient.post(`/favorites/${recipeId}`, payload);
  },

  // Cập nhật ghi chú cá nhân trong database
  updateFavoriteNote(recipeId, data = {}) {
    const payload =
      typeof data === 'string'
        ? { personalNotes: data }
        : { personalNotes: data?.personalNotes ?? data?.note ?? '', ...data };
    return axiosClient.put(`/favorites/${recipeId}`, payload);
  },

  // Bỏ yêu thích khỏi database
  removeFavorite(recipeId) {
    return axiosClient.delete(`/favorites/${recipeId}`);
  },
};

export default favoritesApi;
