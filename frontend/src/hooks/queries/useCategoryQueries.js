import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import categoriesApi from '../../api/categories.api';


const invalidateCategoryRecipes = (queryClient) => Promise.all(
  ['recipe', 'my-recipes', 'recipes', 'favorites', 'home-recipes', 'admin-recipes', 'pending-recipes']
    .map(key => queryClient.invalidateQueries({ queryKey: [key] }))
);

// --- QUERIES ---

export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: ['categories', localStorage.getItem('token') || null],
    queryFn: () => categoriesApi.getCategories(),
    ...options,
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
    onSuccess: async (response) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      queryClient.setQueryData(['categories', localStorage.getItem('token') || null], (previous) =>
        previous ? { ...previous, DT: [...previous.DT.filter(c => c.categoryId !== response.DT.categoryId), response.DT] } : undefined);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }) => categoriesApi.updateCategory(categoryId, data),
    onSuccess: async (response, { categoryId }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      queryClient.setQueriesData({ queryKey: ['categories'] }, (previous) => previous ? {
        ...previous, DT: previous.DT.map(c => c.categoryId === categoryId ? { ...c, ...response.DT } : c),
      } : undefined);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      await invalidateCategoryRecipes(queryClient);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId) => categoriesApi.deleteCategory(categoryId),
    onSuccess: async (_response, categoryId) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      queryClient.setQueriesData({ queryKey: ['categories'] }, (previous) => previous ? {
        ...previous, DT: previous.DT.filter(c => c.categoryId !== categoryId),
      } : undefined);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      await invalidateCategoryRecipes(queryClient);
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      await invalidateCategoryRecipes(queryClient);
    },
  });
};

export const useDeleteAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId) => categoriesApi.deleteAdminCategory(categoryId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      await invalidateCategoryRecipes(queryClient);
    },
  });
};
