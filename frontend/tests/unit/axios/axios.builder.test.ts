import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { AxiosBuilder } from '@axios/axios.builder';
import { http } from '@axios/axios.instance';

describe('AxiosBuilder', () => {
   it('cria a instância com baseURL, JSON e credenciais', () => {
      // Arrange
      const builder = AxiosBuilder.build().withUrl('/api').withJsonContentType().haveCredentials();

      // Act
      const instance = builder.toDomain().initInstance();

      // Assert
      expect(instance.defaults.baseURL).toBe('/api');
      expect(instance.defaults.withCredentials).toBe(true);
      expect(instance.defaults.headers['content-type']).toBe('application/json');
   });

   it('não envia credenciais quando haveCredentials não é chamado', () => {
      // Arrange
      const builder = AxiosBuilder.build().withUrl('/api');

      // Act
      const instance = builder.toDomain().initInstance();

      // Assert
      expect(instance.defaults.withCredentials).toBe(false);
   });

   it('mescla headers extras sem perder o content-type', () => {
      // Arrange
      const builder = AxiosBuilder.build().withJsonContentType().withHeaders({ 'X-Test': 'sim' });

      // Act
      const instance = builder.toDomain().initInstance();

      // Assert
      expect(instance.defaults.headers['content-type']).toBe('application/json');
      expect(instance.defaults.headers['X-Test']).toBe('sim');
   });

   it('aplica os middlewares na ordem de registro', () => {
      // Arrange
      const calls: string[] = [];
      const first = vi.fn((_: AxiosInstance) => calls.push('first'));
      const second = vi.fn((_: AxiosInstance) => calls.push('second'));
      const third = vi.fn((_: AxiosInstance) => calls.push('third'));
      const builder = AxiosBuilder.build().withMiddleware(first).withMiddlewares([second, third]);

      // Act
      const instance = builder.toDomain().initInstance();

      // Assert
      expect(calls).toEqual(['first', 'second', 'third']);
      expect(first).toHaveBeenCalledWith(instance);
   });
});

describe('http (instância única)', () => {
   it('usa /api em desenvolvimento e envia o cookie da sessão', () => {
      // Arrange
      const expectedBaseUrl = '/api';

      // Act
      const { baseURL, withCredentials } = http.defaults;

      // Assert
      expect(baseURL).toBe(expectedBaseUrl);
      expect(withCredentials).toBe(true);
   });
});
