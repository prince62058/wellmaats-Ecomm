import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

const initialState = {
  isLoading: false,
  data: null,
};

export const fetchSiteSettings = createAsyncThunk(
  "/siteSettings/fetch",
  async () => {
    const response = await axiosInstance.get(
      `/api/common/site-settings/get`
    );
    return response.data;
  }
);

export const updateSiteSettings = createAsyncThunk(
  "/siteSettings/update",
  async (payload) => {
    const response = await axiosInstance.put(
      `/api/admin/site-settings/update`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  }
);

export const resetSiteSettings = createAsyncThunk(
  "/siteSettings/reset",
  async () => {
    const response = await axiosInstance.post(
      `/api/admin/site-settings/reset`,
      {},
      { withCredentials: true }
    );
    return response.data;
  }
);

const siteSettingsSlice = createSlice({
  name: "siteSettings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSiteSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchSiteSettings.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateSiteSettings.fulfilled, (state, action) => {
        state.data = action.payload.data;
      })
      .addCase(resetSiteSettings.fulfilled, (state, action) => {
        state.data = action.payload.data;
      });
  },
});

export default siteSettingsSlice.reducer;
