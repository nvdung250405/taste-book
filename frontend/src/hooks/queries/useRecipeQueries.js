import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import recipesApi from '../../api/recipes.api';

// --- PUBLIC & USER RECIPE QUERIES ---

export const useRecipes = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipesApi.getRecipes(params),
    ...options,
  });
};

export const useRecipeDetail = (recipeId, options = {}) => {
  return useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => recipesApi.getRecipeDetail(recipeId),
    enabled: !!recipeId,
    ...options,
  });
};

export const useScaledRecipe = (recipeId, servings, options = {}) => {
  return useQuery({
    queryKey: ['recipe', recipeId, 'scale', servings],
    queryFn: () => recipesApi.scaleRecipe(recipeId, servings),
    enabled: !!recipeId && !!servings,
    ...options,
  });
};

export const useMyRecipes = () => {
  return useQuery({
    queryKey: ['my-recipes'],
    queryFn: () => recipesApi.getMyRecipes(),
  });
};

// --- USER RECIPE MUTATIONS ---

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => recipesApi.createRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-recipes'] });
      // Không cần invalidate 'recipes' ngay vì bài viết có thể vào trạng thái Pending
    },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, data }) => recipesApi.updateRecipe(recipeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', variables.recipeId] });
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId) => recipesApi.deleteRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};


// --- ADMIN RECIPE QUERIES ---

export const useAdminRecipes = () => {
  return useQuery({
    queryKey: ['admin-recipes'],
    queryFn: () => recipesApi.getAdminRecipes(),
  });
};

export const usePendingRecipes = () => {
  return useQuery({
    queryKey: ['pending-recipes'],
    queryFn: () => recipesApi.getPendingRecipes(),
  });
};

// --- ADMIN RECIPE MUTATIONS ---

export const useCreateAdminRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => recipesApi.createAdminRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useUpdateAdminRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, data }) => recipesApi.updateAdminRecipe(recipeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', variables.recipeId] });
    },
  });
};

export const useDeleteAdminRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId) => recipesApi.deleteAdminRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useModerateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, data }) => recipesApi.moderateRecipe(recipeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};
