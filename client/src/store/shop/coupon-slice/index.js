import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

const initialState = {
  isLoading: false,
  availableCoupons: [],
  appliedCoupon: null, // { code, title, discountType, discountAmount, discountValueCalculated }
  error: null,
};

export const fetchAvailableCoupons = createAsyncThunk(
  "shopCoupons/fetchAvailableCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/shop/coupons/available`);
      return response?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch available coupons" });
    }
  }
);

export const applyCouponCode = createAsyncThunk(
  "shopCoupons/applyCouponCode",
  async ({ code, cartSubtotal, userId, userEmail }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/shop/coupons/apply`, {
        code,
        cartSubtotal,
        userId,
        userEmail,
      });
      return response?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to apply coupon" });
    }
  }
);

const shopCouponSlice = createSlice({
  name: "shopCoupons",
  initialState,
  reducers: {
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
      state.error = null;
    },
    setAppliedCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableCoupons = action.payload?.data || [];
      })
      .addCase(fetchAvailableCoupons.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(applyCouponCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyCouponCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appliedCoupon = action.payload?.data;
        state.error = null;
      })
      .addCase(applyCouponCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Invalid coupon";
      });
  },
});

export const { clearAppliedCoupon, setAppliedCoupon } = shopCouponSlice.actions;
export default shopCouponSlice.reducer;
