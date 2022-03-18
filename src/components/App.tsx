import React, { ReactElement } from "react";
import styles from "./App.module.scss";
import Map from "./Map";
import Search from "./Search";

const App: React.FC = (): ReactElement => {
  return (
    <div className={styles.container}>
      <Map />
      <Search />
    </div>
  );
};

export default App;
