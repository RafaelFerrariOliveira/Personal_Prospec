import { combineReducers } from '@reduxjs/toolkit';
import sessionReducer from './reducers/session/sessionSlice';
import userReducer from './reducers/user/userSlice';

// Só estado global cross-cutting (checklist de redux-toolkit.md). Dado de feature fica no controller.
export const rootReducer = combineReducers({
   session: sessionReducer,
   user: userReducer,
});
