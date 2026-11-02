import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@store/store';

// Estado global de sessão (cross-cutting). Token de acesso/refresh nunca vem para cá: fica em cookie httpOnly.
export type TSessionState = {
   isSessionBootstrapped: boolean;
   csrfToken: string | null;
};

const initialState: TSessionState = {
   isSessionBootstrapped: false,
   csrfToken: null,
};

const sessionSlice = createSlice({
   name: 'session',
   initialState,
   reducers: {
      markSessionBootstrapped(state) {
         state.isSessionBootstrapped = true;
      },
      setCsrfToken(state, { payload }: PayloadAction<string>) {
         state.csrfToken = payload;
      },
      clearSession(state) {
         state.isSessionBootstrapped = false;
         state.csrfToken = null;
      },
   },
});

export const selectIsSessionBootstrapped = (state: RootState): boolean => state.session.isSessionBootstrapped;
export const selectCsrfToken = (state: RootState): string | null => state.session.csrfToken;

export const { markSessionBootstrapped, setCsrfToken, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
