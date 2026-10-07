import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authApi from '../../api/auth.api';
import { clearAuthSession } from '../../lib/authSession';

// --- AUTH MUTATIONS ---

export const useRegister = () => {
  return useMutation({
    mutationFn: (data) => authApi.register(data),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (response) => {
      // API spec says response.DT contains accessToken and user
      if (response.DT && response.DT.accessToken) {
        localStorage.setItem('token', response.DT.accessToken);
        // Tùy thuộc bạn lưu user info ở đâu (localStorage, Zustand)
        // localStorage.setItem('user', JSON.stringify(response.DT.user));
        
        // Invalidate profile query to refetch after login
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Clear the session even when the logout request fails.
      clearAuthSession(queryClient);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data) => authApi.forgotPassword(data),
  });
};

// --- PROFILE QUERIES & MUTATIONS ---

export const useProfile = (options = {}) => {
  const hasToken = !!localStorage.getItem('token');
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    enabled: hasToken, // Chỉ gọi API nếu có token
    retry: false, // Không retry nếu token hết hạn / lỗi 401
    ...options,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => authApi.changePassword(data),
  });
};
