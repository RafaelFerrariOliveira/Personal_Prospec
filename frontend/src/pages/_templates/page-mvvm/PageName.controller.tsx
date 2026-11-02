import { useCallback } from 'react';
import type { IPageNameController, IPageNameControllerDeps } from './PageName.types';

const UsePageNameController = ({ navigate }: IPageNameControllerDeps): IPageNameController => {
   const onAction = useCallback(() => {
      navigate('/example');
   }, [navigate]);

   return { title: 'Page Title', onAction };
};

export default UsePageNameController;
