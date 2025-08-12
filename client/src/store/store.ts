import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import todosReducer from '../features/todos/todosSlice';
import { baseApi } from '../api/baseApi';
import { attachTokenRefresher } from "./tokenRefresher";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();
    const isLoggedIn = Boolean(state.auth?.accessToken);
    if (isLoggedIn) {
      localStorage.setItem("todosFilter", state.todos.filter);
    } else {
      localStorage.removeItem("todosFilter");
    }
  });
}

if (typeof window !== "undefined") {
  attachTokenRefresher(store);
}