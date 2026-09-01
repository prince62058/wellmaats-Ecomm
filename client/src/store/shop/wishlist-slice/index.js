import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

const initialState = {
  isLoading: false,
  products: [], // array of product _id strings in wishlist
};

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (userId) => {
  const res = await axiosInstance.get(`/api/shop/wishlist/${userId}`);
  return res.data;
});

export const toggleWishlistItem = createAsyncThunk("wishlist/toggle", async ({ userId, productId }) => {
  const res = await axiosInstance.post("/api/shop/wishlist/toggle", { userId, productId });
  return res.data;
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload?.data?.products || [];
      })
      .addCase(fetchWishlist.rejected, (state) => { state.isLoading = false; })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.products = action.payload?.data?.products || [];
      });
  },
});

export default wishlistSlice.reducer;
