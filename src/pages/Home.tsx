import Map from "../components/Map";
import styles from "./Home.module.scss";
import { BrowserRouter as Router } from "react-router-dom";
import Nav from "../components/Nav";
import { useState } from "react";
import Search from "../components/Search";

const Home: React.FC = () => {
  const [isFindTab, setIsFindTab] = useState(
    Boolean(window.location.href.indexOf("new") !== -1)
  );
  return (
    <Router>
      <div className={styles.container}>
        <Nav isFindTab={isFindTab} setIsFindTab={setIsFindTab} />
        <div className={styles.wrapper}>
          <Search setIsFindTab={setIsFindTab} />
          <Map />
        </div>
      </div>
    </Router>
  );
};

export default Home;
