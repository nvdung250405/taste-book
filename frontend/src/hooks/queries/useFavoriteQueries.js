import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import favoritesApi from '../../api/favorites.api';

export const useFavorites = (options = {}) => {
  const hasToken = !!localStorage.getItem('token');

  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getFavorites(),
    enabled: hasToken,
    retry: false,
    ...options,
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
    // Optimistic Update: Cập nhật UI ngay lập tức khi người dùng bấm hủy lưu
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      const previousFavorites = queryClient.getQueryData(['favorites']);

      queryClient.setQueryData(['favorites'], (old) => {
        if (!old) return old;
        const currentList = Array.isArray(old.DT)
          ? old.DT
          : (old.DT?.items || []);

        const filtered = currentList.filter((item) => {
          const id =
            item.recipe?._id ||
            item.recipe?.id ||
            item.recipeId ||
            item._id ||
            item.id;
          return String(id) !== String(recipeId);
        });

        if (Array.isArray(old.DT)) {
          return { ...old, DT: filtered };
        } else if (old.DT?.items) {
          return {
            ...old,
            DT: {
              ...old.DT,
              items: filtered,
              total: Math.max(0, (old.DT.total || filtered.length + 1) - 1),
            },
          };
        }
        return { ...old, DT: filtered };
      });

      return { previousFavorites };
    },
    onError: (err, recipeId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};
