import { lazy } from 'react';

// React.lazy() de cada página privada (protegidas por AuthRequiredRoutes).
export const LazyImports = {
   Home: lazy(() => import('@pages/Home/Home')),
};
