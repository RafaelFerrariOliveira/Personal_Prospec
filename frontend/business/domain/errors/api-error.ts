/** Erro de negócio da API (400 com lista de notifications): a tela exibe `messages`. */
export class ApiError extends Error {
   readonly messages: string[];
   readonly status: number;

   constructor(messages: string[], status: number) {
      super(messages.join(' '));
      this.name = 'ApiError';
      this.messages = messages;
      this.status = status;
   }
}
