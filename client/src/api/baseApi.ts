import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axiosInstance from "../utils/axiosInstance";
import type { RootState } from "../store/store";
import {
  refreshToken as refreshTokenAction,
  logout,
  setCredentials,
} from "../features/auth/authSlice";
import type { RefreshResponse } from "../types/auth";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
};

const AUTH_PATHS = new Set([
  "auth/login",
  "auth/register",
  "auth/refresh",
  "auth/logout",
]);

const isAuthPath = (url: string) => AUTH_PATHS.has(url.replace(/^\//, ""));
const shouldRefresh = (status?: number) => status === 401 || status === 403;

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, unknown> =>
  async (args, api) => {
    const state = api.getState() as RootState;

    const accessToken = state.auth.accessToken ?? null;
    const refreshToken = state.auth.refreshToken ?? null;

    const { url, method = "GET", data, params } = args;
    const authRequest = isAuthPath(url);

    try {
      const res = await axiosInstance.request({
        url,
        method,
        data,
        params,
        headers:
          !authRequest && accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
      });
      return { data: res.data };
    } catch (e) {
      const err = e as AxiosError<unknown>;
      const status = err.response?.status ?? 0;
      const payload = err.response?.data ?? err.message;

      if (shouldRefresh(status) && !authRequest && refreshToken) {
        try {
          const refreshRes = await axiosInstance.post<RefreshResponse>(
            "auth/refresh",
            { refreshToken }
          );
          const {
            accessToken: newAccess,
            refreshToken: newRefresh,
            user,
          } = refreshRes.data;

          if (user) {
            api.dispatch(
              setCredentials({
                accessToken: newAccess,
                refreshToken: newRefresh,
                user,
              })
            );
          } else {
            api.dispatch(
              refreshTokenAction({
                accessToken: newAccess,
                refreshToken: newRefresh,
              })
            );
          }

          const retryRes = await axiosInstance.request({
            url,
            method,
            data,
            params,
            headers: { Authorization: `Bearer ${newAccess}` },
          });
          return { data: retryRes.data };
        } catch (refreshErr) {
          api.dispatch(logout());
          return {
            error: {
              status:
                (refreshErr as AxiosError<unknown>).response?.status ?? 401,
              data:
                (refreshErr as AxiosError<unknown>).response?.data ||
                (refreshErr as Error).message ||
                "Invalid refresh token",
            },
          };
        }
      }

      return { error: { status, data: payload } };
    }
  };

export const baseApi = createApi({
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Todos"],
  endpoints: () => ({}),
});
