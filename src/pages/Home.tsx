import Map from "../components/Map";
import styles from "./Home.module.scss";
import { ReactElement } from "react";
import Search from "../components/Search";
import { HomePropType } from "../types";

const Home: React.FC<HomePropType> = (): ReactElement => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Search />
        <Map />
      </div>
    </div>
  );
};

export default Home;
