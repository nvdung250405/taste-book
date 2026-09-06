import { useMutation } from '@tanstack/react-query';
import uploadApi from '../../api/upload.api';

// --- UPLOAD MUTATIONS ---

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file) => uploadApi.uploadImage(file),
  });
};

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: (publicId) => uploadApi.deleteImage(publicId),
  });
};
