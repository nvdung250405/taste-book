import axiosClient from './axiosClient';

const recipeListsApi = {
  // --- QUẢN LÝ THỰC ĐƠN ---

  // Lấy danh sách thực đơn
  getRecipeLists() {
    return axiosClient.get('/recipe-lists');
  },

  // Tạo thực đơn mới
  createRecipeList(data) {
    // data: { listName }
    return axiosClient.post('/recipe-lists', data);
  },

  // Đổi tên thực đơn
  updateRecipeList(listId, data) {
    // data: { listName }
    return axiosClient.put(`/recipe-lists/${listId}`, data);
  },

  // Xóa thực đơn
  deleteRecipeList(listId) {
    return axiosClient.delete(`/recipe-lists/${listId}`);
  },


  // --- QUẢN LÝ MÓN ĂN TRONG THỰC ĐƠN ---

  // Xem chi tiết thực đơn (danh sách món)
  getRecipeListItems(listId) {
    return axiosClient.get(`/recipe-lists/${listId}`);
  },

  // Thêm món vào thực đơn
  addRecipeToMenu(listId, data) {
    // data: { recipeId, targetServings }
    return axiosClient.post(`/recipe-lists/${listId}/items`, data);
  },

  // Đổi khẩu phần N món trong thực đơn
  updateRecipePortion(listId, itemId, data) {
    // data: { targetServings }
    return axiosClient.put(`/recipe-lists/${listId}/items/${itemId}`, data);
  },

  // Xóa món khỏi thực đơn
  removeRecipeFromMenu(listId, itemId) {
    return axiosClient.delete(`/recipe-lists/${listId}/items/${itemId}`);
  }
};

export default recipeListsApi;
