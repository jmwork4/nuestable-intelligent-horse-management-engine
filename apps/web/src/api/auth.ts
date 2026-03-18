import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { useAuthStore } from '@/stores/auth';
import type { AuthTokens, LoginInput, RegisterInput, SessionUser } from '@nuestable/shared';

async function login(input: LoginInput): Promise<AuthTokens & { user: SessionUser }> {
  const { data } = await apiClient.post('/auth/login', input);
  return data;
}

async function register(input: RegisterInput): Promise<AuthTokens & { user: SessionUser }> {
  const { data } = await apiClient.post('/auth/register', input);
  return data;
}

async function getMe(): Promise<SessionUser> {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLogout() {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      authStore.logout();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
  });
}
