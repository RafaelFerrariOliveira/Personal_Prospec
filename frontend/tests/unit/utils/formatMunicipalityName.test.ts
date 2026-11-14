import { describe, expect, it } from 'vitest';
import { formatMunicipalityName } from '@utils/formatMunicipalityName';

describe('formatMunicipalityName', () => {
   it.each([
      ['BAURU', 'Bauru'],
      ['SÃO JOSÉ DO RIO PRETO', 'São José do Rio Preto'],
      ['MOGI DAS CRUZES', 'Mogi das Cruzes'],
      ["SANTA BÁRBARA D'OESTE", "Santa Bárbara d'Oeste"],
      ['EMBU-GUAÇU', 'Embu-Guaçu'],
      ['SÃO JOÃO DEL-REI', 'São João del-Rei'],
   ])('converte "%s" do IBGE para "%s"', (raw, expected) => {
      // Act
      const result = formatMunicipalityName(raw);

      // Assert
      expect(result).toBe(expected);
   });

   it('conectivo no início do nome fica com inicial maiúscula', () => {
      // Act
      const result = formatMunicipalityName('DOS SANTOS');

      // Assert
      expect(result).toBe('Dos Santos');
   });

   it('nome já formatado não muda e espaços extras são removidos', () => {
      // Act
      const result = formatMunicipalityName('  Bauru  ');

      // Assert
      expect(result).toBe('Bauru');
   });
});
