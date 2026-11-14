import { formatMunicipalityName } from '@utils/formatMunicipalityName';

export interface ILocationName {
   state: string;
   name: string;
}

/** Resumo da localização da campanha: "UF: Cidade 1, Cidade 2". Vazio quando não há cidade (quem chama decide o texto). */
export const formatLocationSummary = (locations: ILocationName[]): string => {
   const first = locations[0];
   if (!first) return '';
   return `${first.state}: ${locations.map((location) => formatMunicipalityName(location.name)).join(', ')}`;
};
