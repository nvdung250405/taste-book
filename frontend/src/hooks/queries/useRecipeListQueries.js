import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import recipeListsApi from '../../api/recipeLists.api';

// --- RECIPE LIST QUERIES ---

export const useRecipeLists = () => {
  return useQuery({
    queryKey: ['recipe-lists'],
    queryFn: () => recipeListsApi.getRecipeLists(),
  });
};

export const useRecipeListItems = (listId, options = {}) => {
  return useQuery({
    queryKey: ['recipe-list', listId],
    queryFn: () => recipeListsApi.getRecipeListItems(listId),
    enabled: !!listId,
    ...options,
  });
};

// --- RECIPE LIST MUTATIONS ---

export const useCreateRecipeList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => recipeListsApi.createRecipeList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-lists'] });
    },
  });
};

export const useUpdateRecipeList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, data }) => recipeListsApi.updateRecipeList(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-lists'] });
    },
  });
};

export const useDeleteRecipeList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId) => recipeListsApi.deleteRecipeList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-lists'] });
    },
  });
};


// --- RECIPE LIST ITEMS MUTATIONS ---

export const useAddRecipeToMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, data }) => recipeListsApi.addRecipeToMenu(listId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipe-lists'] }); // update totalItems
      queryClient.invalidateQueries({ queryKey: ['recipe-list', variables.listId] });
    },
  });
};

export const useUpdateRecipePortion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemId, data }) => recipeListsApi.updateRecipePortion(listId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipe-list', variables.listId] });
    },
  });
};

export const useRemoveRecipeFromMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemId }) => recipeListsApi.removeRecipeFromMenu(listId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipe-lists'] });
      queryClient.invalidateQueries({ queryKey: ['recipe-list', variables.listId] });
    },
  });
};
