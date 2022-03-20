import Map from "../components/Map";
import styles from "./Home.module.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NewReview from "../components/NewReview";
import Nav from "../components/Nav";
import FindReview from "../components/FindReview";
const Home: React.FC = () => {
  return (
    <Router>
      <div className={styles.container}>
        <Nav />
        <div className={styles.wrapper}>
          <Routes>
            <Route path="/" element={<FindReview />}></Route>
            <Route path="/new" element={<NewReview />}></Route>
          </Routes>
          <Map />
        </div>
      </div>
    </Router>
  );
};

export default Home;
