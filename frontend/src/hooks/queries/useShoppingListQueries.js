import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import shoppingListsApi from '../../api/shoppingLists.api';

// --- SHOPPING LIST QUERIES ---

export const useShoppingLists = () => {
  return useQuery({
    queryKey: ['shopping-lists'],
    queryFn: () => shoppingListsApi.getShoppingLists(),
  });
};

export const useShoppingListDetail = (shoppingListId, options = {}) => {
  return useQuery({
    queryKey: ['shopping-list', shoppingListId],
    queryFn: () => shoppingListsApi.getShoppingListDetail(shoppingListId),
    enabled: !!shoppingListId,
    ...options,
  });
};


// --- SHOPPING LIST MUTATIONS ---

export const useCreateShoppingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => shoppingListsApi.createShoppingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
};

export const useUpdateShoppingListStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shoppingListId, data }) => shoppingListsApi.updateShoppingListStatus(shoppingListId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      queryClient.invalidateQueries({ queryKey: ['shopping-list', variables.shoppingListId] });
    },
  });
};

export const useDeleteShoppingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shoppingListId) => shoppingListsApi.deleteShoppingList(shoppingListId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
};


// --- SHOPPING LIST ITEMS MUTATIONS ---

export const useToggleItemStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shoppingListId, itemId, data }) => shoppingListsApi.toggleItemStatus(shoppingListId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', variables.shoppingListId] });
    },
  });
};

export const useAddCustomItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shoppingListId, data }) => shoppingListsApi.addCustomItem(shoppingListId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', variables.shoppingListId] });
    },
  });
};
