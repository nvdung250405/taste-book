import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ingredientsApi from '../../api/ingredients.api';

// --- INGREDIENTS ---

export const useSearchIngredients = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['ingredients', params],
    queryFn: () => ingredientsApi.searchIngredients(params),
    ...options,
  });
};

export const useCreateAdminIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ingredientsApi.createAdminIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useUpdateAdminIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ingredientId, data }) => ingredientsApi.updateAdminIngredient(ingredientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useDeleteAdminIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ingredientId) => ingredientsApi.deleteAdminIngredient(ingredientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};


// --- INGREDIENT CATEGORIES ---

export const useIngredientCategories = () => {
  return useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: () => ingredientsApi.getIngredientCategories(),
    staleTime: 5 * 60 * 1000, // Ít khi thay đổi
  });
};

export const useCreateAdminIngredientCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ingredientsApi.createAdminIngredientCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-categories'] });
    },
  });
};


// --- UNITS ---

export const useUnits = () => {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => ingredientsApi.getUnits(),
    staleTime: 5 * 60 * 1000, // Ít khi thay đổi
  });
};

export const useCreateAdminUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ingredientsApi.createAdminUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

export const useUpdateAdminUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, data }) => ingredientsApi.updateAdminUnit(unitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

export const useDeleteAdminUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unitId) => ingredientsApi.deleteAdminUnit(unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};
