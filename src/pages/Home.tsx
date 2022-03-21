import Map from "../components/Map";
import styles from "./Home.module.scss";
import { BrowserRouter as Router } from "react-router-dom";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
const Home: React.FC = () => {
  return (
    <Router>
      <div className={styles.container}>
        <Nav />
        <div className={styles.wrapper}>
          <Sidebar />
          <Map />
        </div>
      </div>
    </Router>
  );
};

export default Home;
