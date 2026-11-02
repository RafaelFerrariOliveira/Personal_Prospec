import { describe, expect, it } from 'vitest';
import { formatLocationSummary } from '@utils/formatLocationSummary';

describe('formatLocationSummary', () => {
   it('monta "UF: cidades" na ordem recebida', () => {
      // Act
      const result = formatLocationSummary([
         { state: 'SP', name: 'SAO PAULO' },
         { state: 'SP', name: 'CAMPINAS' },
      ]);

      // Assert
      expect(result).toBe('SP: SAO PAULO, CAMPINAS');
   });

   it('uma cidade só', () => {
      // Act
      const result = formatLocationSummary([{ state: 'RJ', name: 'NITEROI' }]);

      // Assert
      expect(result).toBe('RJ: NITEROI');
   });

   it('sem cidade devolve texto vazio para quem chama decidir o rótulo', () => {
      // Act
      const result = formatLocationSummary([]);

      // Assert
      expect(result).toBe('');
   });
});
