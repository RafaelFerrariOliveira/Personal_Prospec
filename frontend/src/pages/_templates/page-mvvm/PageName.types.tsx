import type { NavigateFunction } from 'react-router-dom';

export interface IPageNameControllerDeps {
   navigate: NavigateFunction;
}

export interface IPageNameController {
   title: string;
   onAction: () => void;
}

export type IPageNameViewProps = IPageNameController;
