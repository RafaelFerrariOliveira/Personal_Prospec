import { useCallback } from 'react';
import { RoutePaths } from '@routes/routePaths';
import type { IHomeController, IHomeControllerDeps } from './Home.types';

// Página de exemplo do padrão MVVM: substituir quando o objetivo do produto estiver definido.
const UseHomeController = ({ navigate }: IHomeControllerDeps): IHomeController => {
   const onAction = useCallback(() => {
      navigate(RoutePaths.home);
   }, [navigate]);

   return {
      title: 'PersonalProspec',
      description: '[A DEFINIR] objetivo do produto.',
      actionLabel: 'Início',
      onAction,
   };
};

export default UseHomeController;
