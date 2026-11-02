import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
   ZGuid,
   createEmptyPaginatedResponse,
   createPaginatedResponseSchema,
} from '@application/validation/apiResponseSchemas';

const ZItemSchema = z.object({ id: ZGuid, name: z.string() });

describe('apiResponseSchemas', () => {
   it('aceita a página no shape do backend', () => {
      // Arrange
      const schema = createPaginatedResponseSchema(ZItemSchema);
      const page = {
         items: [{ id: '0b7f3c2e-1a2b-4c3d-8e9f-a0b1c2d3e4f5', name: 'Item' }],
         totalCount: 1,
         pageNumber: 1,
         pageSize: 10,
         totalPages: 1,
      };

      // Act
      const result = schema.safeParse(page);

      // Assert
      expect(result.success).toBe(true);
   });

   it('rejeita página sem os metadados obrigatórios', () => {
      // Arrange
      const schema = createPaginatedResponseSchema(ZItemSchema);

      // Act
      const result = schema.safeParse({ items: [] });

      // Assert
      expect(result.success).toBe(false);
   });

   it('aceita Guid sequencial do EF Core que não segue a variante RFC', () => {
      // Arrange
      const sequentialGuid = '08dd1e2f-3a4b-5c6d-7e8f-90a1b2c3d4e5';

      // Act
      const result = ZGuid.safeParse(sequentialGuid);

      // Assert
      expect(result.success).toBe(true);
   });

   it('rejeita id que não é Guid', () => {
      // Arrange
      const invalidId = '123';

      // Act
      const result = ZGuid.safeParse(invalidId);

      // Assert
      expect(result.success).toBe(false);
   });

   it('cria página vazia com todos os metadados zerados', () => {
      // Arrange
      const expected = { items: [], totalCount: 0, pageNumber: 0, pageSize: 0, totalPages: 0 };

      // Act
      const result = createEmptyPaginatedResponse<string>();

      // Assert
      expect(result).toEqual(expected);
   });
});
