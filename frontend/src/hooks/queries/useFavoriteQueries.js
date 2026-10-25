import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import favoritesApi from '../../api/favorites.api';

export const useFavorites = (params = {}, options = {}) => {
  const isOptions = params && ('enabled' in params || 'staleTime' in params);
  const queryParams = isOptions ? {} : params;
  const queryOptions = isOptions ? params : options;

  const hasToken = !!localStorage.getItem('token');

  return useQuery({
    queryKey: ['favorites', queryParams],
    queryFn: ({ signal }) => favoritesApi.getFavorites({ page: 1, limit: 12, ...queryParams }, { signal }),
    enabled: hasToken,
    retry: false,
    ...queryOptions,
  });
};

// Check only the recipes visible on the current screen, independently of list pagination.
export const useFavoriteIds = (recipeIds) => {
  const ids = [...new Set(recipeIds.filter(Boolean).map(String))].sort();
  return useFavorites({ recipeIds: ids.join(','), page: 1, limit: 100 }, {
    enabled: !!localStorage.getItem('token') && ids.length > 0,
    select: response => new Set((response.DT?.items || []).map(item => String(item.recipeId))),
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, data }) => favoritesApi.addFavorite(recipeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['home-recipes'] });
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

      const previousFavorites = queryClient.getQueriesData({ queryKey: ['favorites'] });

      queryClient.setQueriesData({ queryKey: ['favorites'] }, (old) => {
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

        if (filtered.length === currentList.length) return old;

        if (Array.isArray(old.DT)) {
          return { ...old, DT: filtered };
        } else if (old.DT?.items) {
          return {
            ...old,
            DT: {
              ...old.DT,
              items: filtered,
              total: Math.max(0, (old.DT.total ?? currentList.length) - 1),
            },
          };
        }
        return { ...old, DT: filtered };
      });

      return { previousFavorites };
    },
    onError: (err, recipeId, context) => {
      if (context?.previousFavorites) {
        context.previousFavorites.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['home-recipes'] });
    },
  });
};
