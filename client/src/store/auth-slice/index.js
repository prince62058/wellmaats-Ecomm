import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

export const registerUser = createAsyncThunk("/auth/register", async (formData) => {
  const response = await axiosInstance.post(`/api/auth/register`, formData);
  return response.data;
});

export const loginUser = createAsyncThunk("/auth/login", async (formData) => {
  const response = await axiosInstance.post(`/api/auth/login`, formData);
  return response.data;
});

export const logoutUser = createAsyncThunk("/auth/logout", async () => {
  const response = await axiosInstance.post(`/api/auth/logout`, {});
  return response.data;
});

export const checkAuth = createAsyncThunk("/auth/checkauth", async () => {
  const response = await axiosInstance.get(`/api/auth/check-auth`, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
  });
  return response.data;
});

export const updateProfile = createAsyncThunk("/auth/updateProfile", async (formData) => {
  const response = await axiosInstance.put(`/api/auth/update-profile`, formData);
  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending,   (state) => { state.isLoading = true; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; state.user = null; state.isAuthenticated = false; })
      .addCase(registerUser.rejected,  (state) => { state.isLoading = false; state.user = null; state.isAuthenticated = false; })

      .addCase(loginUser.pending,   (state) => { state.isLoading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected,  (state) => { state.isLoading = false; state.user = null; state.isAuthenticated = false; })

      .addCase(checkAuth.pending,   (state) => { state.isLoading = true; })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected,  (state) => { state.isLoading = false; state.user = null; state.isAuthenticated = false; })

      .addCase(logoutUser.fulfilled, (state) => { state.isLoading = false; state.user = null; state.isAuthenticated = false; })

      .addCase(updateProfile.fulfilled, (state, action) => {
        if (action.payload.success) state.user = action.payload.user;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
