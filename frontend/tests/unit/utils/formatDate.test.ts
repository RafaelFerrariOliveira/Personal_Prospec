import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from '@utils/formatDate';

describe('formatDate e formatDateTime', () => {
   it('formatDate mostra a data no padrão dd/mm/aaaa', () => {
      // Act
      const result = formatDate('2026-11-02T12:00:00Z');

      // Assert
      expect(result).toBe(new Date('2026-11-02T12:00:00Z').toLocaleDateString('pt-BR'));
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
   });

   it('formatDateTime mostra data e hora', () => {
      // Act
      const result = formatDateTime('2026-11-02T12:30:00Z');

      // Assert
      expect(result).toBe(new Date('2026-11-02T12:30:00Z').toLocaleString('pt-BR'));
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}.+\d{2}:\d{2}:\d{2}$/);
   });

   it.each([formatDate, formatDateTime])('texto que não é data volta como veio (%o)', (format) => {
      // Act
      const result = format('sem-data');

      // Assert
      expect(result).toBe('sem-data');
   });
});
