// Conectivos que ficam em minúsculas no meio do nome ("São José do Rio Preto", "São João del-Rei").
const LOWERCASE_PARTS = new Set(['da', 'das', 'de', 'del', 'do', 'dos', 'e']);

const capitalize = (part: string): string => part.charAt(0).toLocaleUpperCase('pt-BR') + part.slice(1);

const formatPart = (part: string, isFirst: boolean): string => {
   if (!isFirst && LOWERCASE_PARTS.has(part)) return part;
   // "d'oeste" vira "d'Oeste" (Santa Bárbara d'Oeste).
   if (!isFirst && part.startsWith("d'") && part.length > 2) return `d'${capitalize(part.slice(2))}`;
   return capitalize(part);
};

/** Os nomes de município chegam do IBGE em caixa alta ("BAURU"); a tela mostra em caixa de título ("Bauru"). */
export const formatMunicipalityName = (name: string): string =>
   name
      .trim()
      .toLocaleLowerCase('pt-BR')
      .split(/\s+/)
      .map((word, wordIndex) =>
         word
            .split('-')
            .map((part, partIndex) => formatPart(part, wordIndex === 0 && partIndex === 0))
            .join('-'),
      )
      .join(' ');
