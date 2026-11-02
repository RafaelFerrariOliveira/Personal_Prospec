import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { NavigateFunction } from 'react-router-dom';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import type { TLoginRequest } from '@request/login.request';
import type { AppDispatch } from '@store/store';

export interface ILoginControllerDeps {
   authenticationService: IAuthenticationService;
   navigate: NavigateFunction;
   dispatch: AppDispatch;
}

export interface ILoginController {
   register: UseFormRegister<TLoginRequest>;
   errors: FieldErrors<TLoginRequest>;
   submitErrors: string[];
   isSubmitting: boolean;
   onSubmit: FormEventHandler<HTMLFormElement>;
}

export type ILoginViewProps = ILoginController;
