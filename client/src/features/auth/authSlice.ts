import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const loadAuthState = (): AuthState => {
  const storedAuth = localStorage.getItem("auth");
  if (storedAuth) {
    return JSON.parse(storedAuth);
  }
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
  };
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("auth", JSON.stringify(action.payload));
    },
    refreshToken: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      const storedAuth = localStorage.getItem("auth");
      let auth = { user: null, accessToken: null, refreshToken: null };

      if (storedAuth) {
        try {
          auth = JSON.parse(storedAuth);
        } catch {
          auth = { user: null, accessToken: null, refreshToken: null };
        }
      }
      localStorage.setItem(
        "auth",
        JSON.stringify({
          ...auth,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        })
      );
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { setCredentials, refreshToken, logout } = authSlice.actions;
export default authSlice.reducer;
