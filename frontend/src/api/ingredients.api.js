import axiosClient from './axiosClient';

const ingredientsApi = {
  // --- INGREDIENTS ---
  
  // Gợi ý nguyên liệu
  searchIngredients(params) {
    // params: { search }
    return axiosClient.get('/ingredients', { params });
  },

  // Thêm nguyên liệu chuẩn (Admin)
  createAdminIngredient(data) {
    return axiosClient.post('/admin/ingredients', data);
  },

  // Sửa nguyên liệu (Admin)
  updateAdminIngredient(ingredientId, data) {
    return axiosClient.put(`/admin/ingredients/${ingredientId}`, data);
  },

  // Xóa nguyên liệu (Admin)
  deleteAdminIngredient(ingredientId) {
    return axiosClient.delete(`/admin/ingredients/${ingredientId}`);
  },


  // --- INGREDIENT CATEGORIES ---

  // Lấy nhóm nguyên liệu
  getIngredientCategories() {
    return axiosClient.get('/ingredient-categories');
  },

  // Tạo nhóm nguyên liệu (Admin)
  createAdminIngredientCategory(data) {
    return axiosClient.post('/admin/ingredient-categories', data);
  },


  // --- UNITS ---

  // Lấy danh sách đơn vị đo
  getUnits() {
    return axiosClient.get('/units');
  },

  // Thêm đơn vị đo mới (Admin)
  createAdminUnit(data) {
    return axiosClient.post('/admin/units', data);
  },

  // Sửa đơn vị đo (Admin)
  updateAdminUnit(unitId, data) {
    return axiosClient.put(`/admin/units/${unitId}`, data);
  },

  // Xóa đơn vị đo (Admin)
  deleteAdminUnit(unitId) {
    return axiosClient.delete(`/admin/units/${unitId}`);
  }
};

export default ingredientsApi;
