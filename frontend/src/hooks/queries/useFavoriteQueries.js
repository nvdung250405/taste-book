import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import favoritesApi from '../../api/favorites.api';

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getFavorites(),
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, data }) => favoritesApi.addFavorite(recipeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

export const useUpdateFavoriteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, data }) => favoritesApi.updateFavoriteNote(recipeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId) => favoritesApi.removeFavorite(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};
