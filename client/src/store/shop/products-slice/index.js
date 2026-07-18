import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
};

function buildProductQuery(filterParams = {}, sortParams = "price-lowtohigh") {
  const query = new URLSearchParams();
  if (filterParams.category?.length) {
    query.set("category", filterParams.category.join(","));
  }
  if (filterParams.brand?.length) {
    query.set("brand", filterParams.brand.join(","));
  }
  if (filterParams.offers?.includes("flashSale")) {
    query.set("flashSale", "true");
  }
  if (filterParams.offers?.includes("onSale")) {
    query.set("onSale", "true");
  }
  query.set("sortBy", sortParams);
  return query.toString();
}

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }) => {
    const result = await axiosInstance.get(
      `/api/shop/products/get?${buildProductQuery(filterParams, sortParams)}`
    );
    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
    const result = await axiosInstance.get(
      `/api/shop/products/get/${id}`
    );

    return result?.data;
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
