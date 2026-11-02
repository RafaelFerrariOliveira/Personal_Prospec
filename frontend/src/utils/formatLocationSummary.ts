export interface ILocationName {
   state: string;
   name: string;
}

/** Resumo da localização da campanha: "UF: cidade 1, cidade 2". Vazio quando não há cidade (quem chama decide o texto). */
export const formatLocationSummary = (locations: ILocationName[]): string => {
   const first = locations[0];
   if (!first) return '';
   return `${first.state}: ${locations.map((location) => location.name).join(', ')}`;
};
