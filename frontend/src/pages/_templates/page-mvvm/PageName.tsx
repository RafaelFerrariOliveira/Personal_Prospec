import { useInjection } from '@hooks/useInjection';
import { useNavigate } from 'react-router-dom';
import UsePageNameController from './PageName.controller';
import PageNameView from './PageName.view';

const PageName = () => {
   const navigate = useNavigate();
   const controller = UsePageNameController({
      navigate,
   });

   return <PageNameView {...controller} />;
};

export default PageName;
