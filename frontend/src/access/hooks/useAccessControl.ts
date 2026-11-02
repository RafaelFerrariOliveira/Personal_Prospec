import { useMemo } from 'react';
import { createAccessControl, type IAccessControl } from '@access/core/AccessControl';
import { buildAccessContext } from '@access/core/buildAccessContext';
import { selectUser } from '@store/reducers/user/userSlice';
import { useAppSelector } from '@store/store';

export const useAccessControl = (): IAccessControl => {
   const user = useAppSelector(selectUser);
   return useMemo(() => createAccessControl(buildAccessContext(user)), [user]);
};
