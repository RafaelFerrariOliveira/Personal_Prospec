import type { NavigateFunction } from 'react-router-dom';

export interface IHomeControllerDeps {
   navigate: NavigateFunction;
}

export interface IHomeController {
   title: string;
   description: string;
   actionLabel: string;
   onAction: () => void;
}

export type IHomeViewProps = IHomeController;
