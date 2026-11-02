import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@store/store';

export type TSessionUser = { email: string };
export type TUserState = { user: TSessionUser | null };

const initialState: TUserState = { user: null };

const userSlice = createSlice({
   name: 'user',
   initialState,
   reducers: {
      setUser(state, { payload }: PayloadAction<TSessionUser>) {
         state.user = payload;
      },
      clearUser(state) {
         state.user = null;
      },
   },
});

export const selectUser = (state: RootState): TSessionUser | null => state.user.user;

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
