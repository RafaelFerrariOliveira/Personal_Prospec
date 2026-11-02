import type { IPageNameViewProps } from './PageName.types';

const PageNameView = ({ title, onAction }: IPageNameViewProps) => {
   return (
      <div data-testid="page-name">
         <h1>{title}</h1>
         <button type="button" data-testid="page-name-action" onClick={onAction}>
            Action
         </button>
      </div>
   );
};

export default PageNameView;
