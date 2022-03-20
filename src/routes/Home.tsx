import Map from "../components/Map";
import Search from "../components/Search";
import styles from "./Home.module.scss";

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <Search />
      <Map />
    </div>
  );
};

export default Home;
