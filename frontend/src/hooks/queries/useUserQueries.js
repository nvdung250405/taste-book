import { useQuery } from '@tanstack/react-query';
import usersApi from '../../api/users.api';

// --- ADMIN USER QUERIES ---

export const useAdminUsers = (params = {}) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => usersApi.getUsers(params),
    // Thường danh sách user không cần refetch liên tục
    staleTime: 60 * 1000, 
  });
};

export const useAdminUserDetail = (userId) => {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId,
  });
};
