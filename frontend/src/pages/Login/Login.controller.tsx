import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSessionBootstrap } from '@hooks/useSessionBootstrap';
import { ApiError } from '@domain/errors/api-error';
import { ZLoginRequestSchema, type TLoginRequest } from '@request/login.request';
import { RoutePaths } from '@routes/routePaths';
import type { ILoginController, ILoginControllerDeps } from './Login.types';

const GENERIC_ERROR_MESSAGE = 'Não foi possível entrar. Tente novamente em instantes.';

const UseLoginController = ({ authenticationService, navigate, dispatch }: ILoginControllerDeps): ILoginController => {
   const { register, handleSubmit, formState } = useForm<TLoginRequest>({
      resolver: zodResolver(ZLoginRequestSchema),
      defaultValues: { email: '', password: '' },
   });
   const { bootstrapSession } = useSessionBootstrap(authenticationService, dispatch);
   const [submitErrors, setSubmitErrors] = useState<string[]>([]);
   const isSending = useRef(false);

   const submit = useCallback(
      async (request: TLoginRequest): Promise<void> => {
         // Trava duplo envio antes de o estado do formulário refletir isSubmitting.
         if (isSending.current) return;
         isSending.current = true;
         setSubmitErrors([]);
         try {
            await authenticationService.login(request);
            // O token CSRF anônimo não vale após o login: refaz o bootstrap já autenticado.
            await bootstrapSession();
            navigate(RoutePaths.home);
         } catch (error: unknown) {
            setSubmitErrors(error instanceof ApiError ? error.messages : [GENERIC_ERROR_MESSAGE]);
         } finally {
            isSending.current = false;
         }
      },
      [authenticationService, bootstrapSession, navigate],
   );

   return {
      register,
      errors: formState.errors,
      submitErrors,
      isSubmitting: formState.isSubmitting,
      onSubmit: handleSubmit(submit),
   };
};

export default UseLoginController;
