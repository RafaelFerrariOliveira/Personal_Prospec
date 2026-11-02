import { useNavigate } from 'react-router-dom';
import UseHomeController from './Home.controller';
import HomeView from './Home.view';

const Home = () => {
   const navigate = useNavigate();
   const controller = UseHomeController({ navigate });

   return <HomeView {...controller} />;
};

export default Home;
