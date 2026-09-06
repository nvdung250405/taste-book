import axiosClient from './axiosClient';

const uploadApi = {
  // Tải lên hình ảnh
  uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Xóa hình ảnh
  deleteImage(publicId) {
    // Nếu publicId có chứa '/', cần encode trước khi gửi theo đặc tả
    const encodedPublicId = encodeURIComponent(publicId);
    return axiosClient.delete(`/images/${encodedPublicId}`);
  }
};

export default uploadApi;
