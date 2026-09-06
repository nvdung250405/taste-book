import axiosClient from './axiosClient';

const shoppingListsApi = {
  // --- QUẢN LÝ DANH SÁCH ĐI CHỢ ---

  // Lấy các phiên đi chợ
  getShoppingLists() {
    return axiosClient.get('/shopping-lists');
  },

  // Tổng hợp danh sách đi chợ từ các thực đơn
  createShoppingList(data) {
    // data: { title, recipeListIds: [...] }
    return axiosClient.post('/shopping-lists', data);
  },

  // Xem chi tiết checklist mua sắm
  getShoppingListDetail(shoppingListId) {
    return axiosClient.get(`/shopping-lists/${shoppingListId}`);
  },

  // Cập nhật trạng thái chuyến đi chợ (In_Progress / Completed)
  updateShoppingListStatus(shoppingListId, data) {
    // data: { status }
    return axiosClient.patch(`/shopping-lists/${shoppingListId}`, data);
  },

  // Xóa phiên đi chợ
  deleteShoppingList(shoppingListId) {
    return axiosClient.delete(`/shopping-lists/${shoppingListId}`);
  },

  // --- QUẢN LÝ MẶT HÀNG ---

  // Đánh dấu đã mua / chưa mua
  toggleItemStatus(shoppingListId, itemId, data) {
    // data: { isPurchased: true/false }
    return axiosClient.patch(`/shopping-lists/${shoppingListId}/items/${itemId}`, data);
  },

  // Thêm món mua ngoài tự do
  addCustomItem(shoppingListId, data) {
    // data: { itemName, totalQuantity, unit }
    return axiosClient.post(`/shopping-lists/${shoppingListId}/items`, data);
  }
};

export default shoppingListsApi;
