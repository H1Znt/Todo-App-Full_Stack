import { baseApi } from "./baseApi";

export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        data: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "auth/register",
        method: "POST",
        data: credentials,
      }),
    }),
    logout: builder.mutation<{ success: boolean }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: "auth/logout",
        method: "POST",
        data: { refreshToken },
      }),
    }),
    refresh: builder.mutation<
      { accessToken: string; refreshToken: string },
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "auth/refresh",
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
