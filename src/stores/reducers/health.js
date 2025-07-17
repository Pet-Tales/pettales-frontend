import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isConnectedServer: false,
}

const HealthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {
    setIsConnectedServer: (state, action) => {
      state.isConnectedServer = action.payload;
    },
  },
});

const { reducer, actions } = HealthSlice;

export const { setIsConnectedServer } = actions;
export default reducer;
