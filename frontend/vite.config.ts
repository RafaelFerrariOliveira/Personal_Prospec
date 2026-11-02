import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { loadEnv, type PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';

const projectRootDirectory = path.dirname(fileURLToPath(import.meta.url));

const resolveFromProjectRoot = (...pathSegments: string[]): string =>
   path.resolve(projectRootDirectory, ...pathSegments);

const vendorChunkGroups: Record<string, string[]> = {
   'vendor-react': ['react', 'react-dom', 'react-router-dom'],
   'vendor-state': ['@reduxjs/toolkit', 'react-redux'],
   'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
   'vendor-ui': ['styled-components'],
   'vendor-http': ['axios'],
   'vendor-di': ['inversify', 'reflect-metadata'],
};

const resolveVendorChunkName = (moduleId: string): string | undefined => {
   for (const [chunkName, packageNames] of Object.entries(vendorChunkGroups)) {
      if (packageNames.some((packageName) => moduleId.includes(`/node_modules/${packageName}/`))) {
         return chunkName;
      }
   }
   return undefined;
};

const DEFAULT_DEV_API_PROXY_TARGET = 'https://localhost:7180';

/**
 * O Vite local serve a app em HTTP, mas a API marca os cookies como Secure.
 * Remove o Secure só no servidor de desenvolvimento para o navegador aceitar o cookie em http://localhost.
 * Nunca fazer isso em preview/produção: o Secure precisa continuar intacto.
 */
function stripSecureFlagFromSetCookieHeaders(setCookieHeader: string | string[] | undefined): string[] | undefined {
   if (!setCookieHeader) return undefined;

   const cookieHeaders = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
   return cookieHeaders.map((cookieHeader) => cookieHeader.replace(/;\s*secure/gi, ''));
}

/** Hardening básico do navegador no server/preview do Vite. Sem nenhuma URL de produção. */
const SECURITY_RESPONSE_HEADERS: Record<string, string> = {
   'X-Frame-Options': 'DENY',
   'X-Content-Type-Options': 'nosniff',
   'Referrer-Policy': 'strict-origin-when-cross-origin',
   'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
   'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*; img-src 'self' data: blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

export default ({ mode, command }: { mode: string; command: string }) => {
   const viteEnv = loadEnv(mode, projectRootDirectory, 'VITE_');
   const devApiProxyTarget = viteEnv['VITE_API_PROXY_TARGET']?.trim() || DEFAULT_DEV_API_PROXY_TARGET;
   const isDevelopmentServer = command === 'serve' && mode === 'development';

   return defineConfig({
      plugins: [react() as PluginOption],
      test: {
         environment: 'jsdom',
         testTimeout: 15000,
         setupFiles: ['./tests/setup/vitest.setup.ts'],
         include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx', 'tests/integration/**/*.test.ts'],
         coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['business/**/*.{ts,tsx}', 'axios/**/*.{ts,tsx}', 'src/access/**/*.{ts,tsx}'],
            exclude: ['**/*.d.ts', '**/index.ts', '**/*.types.ts', '**/*.types.tsx', '**/dtos/**', '**/enum/**'],
            thresholds: {
               lines: 80,
               functions: 80,
               branches: 70,
               statements: 80,
            },
         },
      },
      base: '/',
      resolve: {
         alias: {
            '@src': resolveFromProjectRoot('src'),
            '@pages': resolveFromProjectRoot('src/pages'),
            '@components': resolveFromProjectRoot('src/components'),
            '@hooks': resolveFromProjectRoot('src/hooks'),
            '@store': resolveFromProjectRoot('src/stores'),
            '@assets': resolveFromProjectRoot('src/assets'),
            '@extensions': resolveFromProjectRoot('src/extensions'),
            '@routes': resolveFromProjectRoot('src/routes'),
            '@access': resolveFromProjectRoot('src/access'),
            '@context': resolveFromProjectRoot('src/context'),
            '@utils': resolveFromProjectRoot('src/utils'),
            '@axios': resolveFromProjectRoot('axios'),
            '@application': resolveFromProjectRoot('business/application'),
            '@services': resolveFromProjectRoot('business/application'),
            '@interfaces': resolveFromProjectRoot('business/application/interfaces'),
            '@request': resolveFromProjectRoot('business/application/dtos/request'),
            '@response': resolveFromProjectRoot('business/application/dtos/response'),
            '@dtos': resolveFromProjectRoot('business/application/dtos'),
            '@domain': resolveFromProjectRoot('business/domain'),
            '@enums': resolveFromProjectRoot('business/domain/enum'),
            '@infrastructure': resolveFromProjectRoot('business/infrastructure'),
            '@shared': resolveFromProjectRoot('business/shared'),
            '@api': resolveFromProjectRoot('business/api'),
            '@core': resolveFromProjectRoot('business/core'),
            '@ioc': resolveFromProjectRoot('business/core/ioc'),
         },
      },
      server: {
         host: true,
         port: 5173,
         strictPort: true,
         headers: SECURITY_RESPONSE_HEADERS,
         proxy: {
            '/api': {
               target: devApiProxyTarget,
               changeOrigin: true,
               secure: false,
               configure: (proxy) => {
                  // Só relaxa o Secure no Vite HTTP local. Preview e produção mantêm o Secure.
                  if (!isDevelopmentServer) return;

                  proxy.on('proxyRes', (proxyResponse) => {
                     const relaxedSetCookieHeaders = stripSecureFlagFromSetCookieHeaders(
                        proxyResponse.headers['set-cookie'],
                     );

                     if (relaxedSetCookieHeaders) {
                        proxyResponse.headers['set-cookie'] = relaxedSetCookieHeaders;
                     }
                  });
               },
            },
         },
      },
      preview: {
         headers: SECURITY_RESPONSE_HEADERS,
      },
      build: {
         rollupOptions: {
            output: {
               manualChunks: resolveVendorChunkName,
            },
         },
      },
   });
};
