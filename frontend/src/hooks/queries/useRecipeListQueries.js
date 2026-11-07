import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import recipeListsApi from '../../api/recipeLists.api';

const isMissing = error => error?.EC === 3 || error?.httpStatus === 404 || error?.response?.status === 404;
const refreshMissing = (client, error, listId) => {
  if (!isMissing(error)) return;
  client.invalidateQueries({ queryKey: ['recipe-lists'] });
  if (listId) client.invalidateQueries({ queryKey: ['recipe-list', listId] });
};

// --- RECIPE LIST QUERIES ---

export const useRecipeLists = () => {
  return useQuery({
    queryKey: ['recipe-lists'],
    queryFn: () => recipeListsApi.getRecipeLists(),
  });
};

export const useRecipeListItems = (listId, options = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['recipe-list', listId],
    queryFn: async () => {
      try { return await recipeListsApi.getRecipeListItems(listId); }
      catch (error) {
        if (isMissing(error)) queryClient.invalidateQueries({ queryKey: ['recipe-lists'] });
        throw error;
      }
    },
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
    onError: (error, variables) => refreshMissing(queryClient, error, variables.listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-lists'] });
    },
  });
};

export const useDeleteRecipeList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId) => recipeListsApi.deleteRecipeList(listId),
    onError: (error, listId) => refreshMissing(queryClient, error, listId),
    onSuccess: (_, listId) => {
      queryClient.removeQueries({ queryKey: ['recipe-list', listId], exact: true });
      queryClient.invalidateQueries({ queryKey: ['recipe-lists'] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
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
    onError: (error, variables) => refreshMissing(queryClient, error, variables.listId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipe-list', variables.listId] });
    },
  });
};

export const useRemoveRecipeFromMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemId }) => recipeListsApi.removeRecipeFromMenu(listId, itemId),
    onError: (error, variables) => refreshMissing(queryClient, error, variables.listId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipe-lists'] });
      queryClient.invalidateQueries({ queryKey: ['recipe-list', variables.listId] });
    },
  });
};
