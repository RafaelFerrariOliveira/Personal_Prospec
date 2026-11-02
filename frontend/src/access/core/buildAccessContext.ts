import type { AccessContext } from '@access/types/access.types';
import type { TSessionUser } from '@store/reducers/user/userSlice';

export const buildAccessContext = (user: TSessionUser | null): AccessContext => ({
   isAuthenticated: user !== null,
});
