import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Loading from '@components/loading/loading';
import AuthRequiredRoutes from './AuthRequiredRoutes';
import { dataPathsImport } from './DataPaths/import';

const RoutesApp = () => {
   return (
      <Router>
         <Suspense fallback={<Loading isLoading={true} />}>
            <Routes>
               {dataPathsImport.publicRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={<route.element />} />
               ))}

               {dataPathsImport.privateRoutes.map((route) => (
                  <Route key={route.path} element={<AuthRequiredRoutes />}>
                     <Route path={route.path} element={<route.element />} />
                  </Route>
               ))}
            </Routes>
         </Suspense>
      </Router>
   );
};

export default RoutesApp;
