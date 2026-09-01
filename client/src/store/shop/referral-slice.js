import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

export const fetchReferralInfo = createAsyncThunk("referral/info", async () => {
  const res = await axiosInstance.get("/api/shop/referral/info");
  return res.data;
});

export const fetchWallet = createAsyncThunk("referral/wallet", async () => {
  const res = await axiosInstance.get("/api/shop/referral/wallet");
  return res.data;
});

export const validateReferralCode = createAsyncThunk("referral/validate", async (code) => {
  const res = await axiosInstance.get(`/api/shop/referral/validate/${code}`);
  return res.data;
});

const referralSlice = createSlice({
  name: "referral",
  initialState: {
    isLoading: false,
    info:      null,   // { referralCode, walletBalance, stats, referrals, walletTransactions }
    wallet:    null,   // { balance, transactions }
    error:     null,
  },
  reducers: {
    clearReferral: (state) => { state.info = null; state.wallet = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchReferralInfo.pending,  (s) => { s.isLoading = true;  s.error = null; })
      .addCase(fetchReferralInfo.fulfilled,(s, a) => { s.isLoading = false; if (a.payload.success) s.info = a.payload.data; })
      .addCase(fetchReferralInfo.rejected, (s) => { s.isLoading = false; s.error = "Failed"; })
      .addCase(fetchWallet.fulfilled, (s, a) => { if (a.payload.success) s.wallet = a.payload.data; });
  },
});

export const { clearReferral } = referralSlice.actions;
export default referralSlice.reducer;
