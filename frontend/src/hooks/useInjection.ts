import { containerIoC } from '@ioc/ioc.config';

/** Resolve uma dependência do container IoC. Usar só no wrapper Nome.tsx (MVVM) e repassar ao controller via deps. */
export function useInjection<T>(type: symbol): T {
   return containerIoC.get<T>(type);
}
