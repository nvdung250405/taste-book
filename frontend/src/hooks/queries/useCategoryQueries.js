import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import categoriesApi from '../../api/categories.api';

// --- QUERIES ---

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getAdminCategories(),
  });
};

// --- USER MUTATIONS ---

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoriesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }) => categoriesApi.updateCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId) => categoriesApi.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// --- ADMIN MUTATIONS ---

export const useCreateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoriesApi.createAdminCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // public có thể bị ảnh hưởng
    },
  });
};

export const useUpdateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }) => categoriesApi.updateAdminCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId) => categoriesApi.deleteAdminCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
