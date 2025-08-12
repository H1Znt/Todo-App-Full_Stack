import type { Store } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import axiosInstance from "../utils/axiosInstance";
import { getTokenExpMs } from "../utils/jwt";
import { setCredentials, refreshToken as refreshAction, logout } from "../features/auth/authSlice";
import type { RefreshResponse } from "../types/auth";

const AHEAD_MS = 30_000; 

let timerId: number | null = null;
let inFlight = false;
let prevAccess: string | null = null;
let prevRefresh: string | null = null;

function clearTimer() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}

async function doRefresh(store: Store<RootState>) {
  if (inFlight) return;

  const state = store.getState();
  const refreshToken = state.auth.refreshToken;

  if (!refreshToken) return;

  inFlight = true;

  try {
    const r = await axiosInstance.post<RefreshResponse>("auth/refresh", { refreshToken });
    const { accessToken, refreshToken: newRefresh, user } = r.data;

    if (user) {
      store.dispatch(setCredentials({ accessToken, refreshToken: newRefresh, user }));
    } else {
      store.dispatch(refreshAction({ accessToken, refreshToken: newRefresh }));
    }
  } catch {
    store.dispatch(logout());
  } finally {
    inFlight = false;
    schedule(store); 
  }
}

function schedule(store: Store<RootState>) {
  clearTimer();

  const { accessToken, refreshToken } = store.getState().auth;
  if (!accessToken || !refreshToken) return;

  const expMs = getTokenExpMs(accessToken);
  if (!expMs) {
    void doRefresh(store);
    return;
  }

  let delay = expMs - Date.now() - AHEAD_MS;
  if (delay < 0) delay = 0;

  timerId = window.setTimeout(() => void doRefresh(store), delay);
}

export function attachTokenRefresher(store: Store<RootState>) {
  schedule(store);

  store.subscribe(() => {
    const s = store.getState().auth;
    if (s.accessToken !== prevAccess || s.refreshToken !== prevRefresh) {
      prevAccess = s.accessToken ?? null;
      prevRefresh = s.refreshToken ?? null;
      schedule(store);
    }
  });

  const onVisibility = () => {
    if (document.visibilityState === "visible") schedule(store);
  };
  const onOnline = () => schedule(store);

  window.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("online", onOnline);

  return () => {
    clearTimer();
    window.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("online", onOnline);
  };
}
