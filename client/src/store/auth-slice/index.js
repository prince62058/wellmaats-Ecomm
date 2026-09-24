import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

const initialState = {
  isAuthenticated: false,
  isLoading: false,
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

export const checkAuth = createAsyncThunk("/auth/checkauth", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/api/auth/check-auth`, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
      timeout: 3000,
    });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { success: false });
  }
});

export const updateProfile = createAsyncThunk("/auth/updateProfile", async (formData) => {
  const response = await axiosInstance.put(`/api/auth/update-profile`, formData);
  return response.data;
});

export const sendOTP = createAsyncThunk("/auth/sendOTP", async ({ identifier }) => {
  const response = await axiosInstance.post(`/api/auth/send-otp`, { identifier });
  return response.data;
});

export const verifyOTPLogin = createAsyncThunk("/auth/verifyOTP", async ({ identifier, otp }) => {
  const response = await axiosInstance.post(`/api/auth/verify-otp`, { identifier, otp });
  return response.data;
});

export const googleLoginUser = createAsyncThunk("/auth/googleLogin", async (payload) => {
  const data = typeof payload === "string" ? { credential: payload } : payload;
  const response = await axiosInstance.post(`/api/auth/google`, data, { withCredentials: true });
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
      })
      .addCase(verifyOTPLogin.pending, (state) => { state.isLoading = true; })
      .addCase(verifyOTPLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(verifyOTPLogin.rejected, (state) => { state.isLoading = false; })

      .addCase(googleLoginUser.pending, (state) => { state.isLoading = true; })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(googleLoginUser.rejected, (state) => { state.isLoading = false; });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
