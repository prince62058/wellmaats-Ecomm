import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

const initialState = {
  isLoading: false,
  couponList: [],
  error: null,
};

export const fetchAllCoupons = createAsyncThunk(
  "adminCoupons/fetchAllCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/admin/coupons/get`);
      return response?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch coupons" });
    }
  }
);

export const addNewCoupon = createAsyncThunk(
  "adminCoupons/addNewCoupon",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/admin/coupons/add`, formData);
      return response?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to add coupon" });
    }
  }
);

export const updateCoupon = createAsyncThunk(
  "adminCoupons/updateCoupon",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/admin/coupons/update/${id}`, formData);
      return response?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update coupon" });
    }
  }
);

export const toggleCouponStatus = createAsyncThunk(
  "adminCoupons/toggleCouponStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/coupons/toggle/${id}`);
      return response?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to toggle status" });
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "adminCoupons/deleteCoupon",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/admin/coupons/delete/${id}`);
      return { id, ...response?.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to delete coupon" });
    }
  }
);

const adminCouponSlice = createSlice({
  name: "adminCoupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCoupons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.couponList = action.payload?.data || [];
      })
      .addCase(fetchAllCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(addNewCoupon.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.couponList.unshift(action.payload.data);
        }
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          const index = state.couponList.findIndex((c) => c._id === updated._id);
          if (index !== -1) {
            state.couponList[index] = updated;
          }
        }
      })
      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          const index = state.couponList.findIndex((c) => c._id === updated._id);
          if (index !== -1) {
            state.couponList[index] = updated;
          }
        }
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.couponList = state.couponList.filter((c) => c._id !== action.payload.id);
      });
  },
});

export default adminCouponSlice.reducer;
