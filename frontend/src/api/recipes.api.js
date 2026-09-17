import axiosClient from './axiosClient';

const recipesApi = {
  // --- PUBLIC & USER RECIPES ---

  // Tìm kiếm / lọc công thức public
  getRecipes(params) {
    // params: { keyword, categoryId, ingredientId, difficulty }
    return axiosClient.get('/recipe/read', { params });
  },

  // Xem chi tiết công thức (Backend chưa support query by ID, tạm truyền qua query)
  getRecipeDetail(recipeId) {
    return axiosClient.get('/recipe/read', { params: { id: recipeId } });
  },

  // Tính định lượng theo số người
  scaleRecipe(recipeId, servings) {
    return axiosClient.get(`/recipes/${recipeId}/scale`, { params: { servings } });
  },

  // Tạo công thức mới
  createRecipe(data) {
    return axiosClient.post('/recipe/create', data);
  },

  // Quản lý công thức của tôi
  getMyRecipes() {
    return axiosClient.get('/recipes/mine');
  },

  // Sửa công thức cá nhân
  updateRecipe(recipeId, data) {
    return axiosClient.put('/recipe/update', { ...data, id: recipeId });
  },

  // Xóa mềm công thức
  deleteRecipe(recipeId) {
    return axiosClient.delete('/recipe/delete', { data: { id: recipeId } });
  },


  // --- ADMIN RECIPES ---

  // Admin xem toàn bộ công thức
  getAdminRecipes() {
    return axiosClient.get('/admin/recipes');
  },

  // Admin tạo công thức chuẩn
  createAdminRecipe(data) {
    return axiosClient.post('/admin/recipes', data);
  },

  // Admin sửa công thức chuẩn
  updateAdminRecipe(recipeId, data) {
    return axiosClient.put(`/admin/recipes/${recipeId}`, data);
  },

  // Admin xóa công thức chuẩn
  deleteAdminRecipe(recipeId) {
    return axiosClient.delete(`/admin/recipes/${recipeId}`);
  },

  // Xem danh sách chờ duyệt
  getPendingRecipes() {
    return axiosClient.get('/admin/recipes/pending');
  },

  // Kiểm duyệt công thức
  moderateRecipe(recipeId, data) {
    // data: { approvalStatus, rejectionReason }
    return axiosClient.patch(`/admin/recipes/${recipeId}/moderation`, data);
  }
};

export default recipesApi;
