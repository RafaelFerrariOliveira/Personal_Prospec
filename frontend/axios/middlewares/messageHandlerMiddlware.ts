import { isAxiosError } from 'axios';
import { z } from 'zod';
import { ApiError } from '@domain/errors/api-error';
import type { TAxiosMiddleware } from '@axios/axios.builder';

// Formato real do backend (DomainNotification serializada): { key, value }.
const ZNotificationListSchema = z.array(z.object({ key: z.string(), value: z.string() }));

export const messageHandlerMiddlware: TAxiosMiddleware = (instance) => {
   instance.interceptors.response.use(undefined, (error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 400) {
         const notifications = ZNotificationListSchema.safeParse(error.response.data);
         if (notifications.success && notifications.data.length > 0) {
            return Promise.reject(
               new ApiError(
                  notifications.data.map((item) => item.value),
                  400,
               ),
            );
         }
      }
      return Promise.reject(error);
   });
};
