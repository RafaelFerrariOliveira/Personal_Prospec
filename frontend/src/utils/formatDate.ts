/** Data (dd/mm/aaaa) no fuso do computador; texto original se a API mandar algo que não é data. */
export const formatDate = (iso: string): string => {
   const date = new Date(iso);
   return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR');
};

/** Data e hora no fuso do computador; texto original se a API mandar algo que não é data. */
export const formatDateTime = (iso: string): string => {
   const date = new Date(iso);
   return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('pt-BR');
};
