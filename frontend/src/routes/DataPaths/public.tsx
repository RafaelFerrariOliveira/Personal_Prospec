import { RoutePaths } from '@routes/routePaths';
import { CommonImports } from '../LazyImports/public';
import type { TRoutePath } from './private';

export const publicRoutes: TRoutePath[] = [{ path: RoutePaths.login, element: CommonImports.Login }];
