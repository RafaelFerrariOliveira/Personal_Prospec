import type { ComponentType, LazyExoticComponent } from 'react';
import { RoutePaths } from '@routes/routePaths';
import { LazyImports } from '../LazyImports/private';

export type TRoutePath = {
   path: string;
   element: LazyExoticComponent<ComponentType>;
};

// Rotas privadas: { path: RoutePaths.xxx, element: LazyImports.Xxx }. Protegidas por AuthRequiredRoutes.
export const privateRoutes: TRoutePath[] = [{ path: RoutePaths.home, element: LazyImports.Home }];
