import React from "react";
import styles from "./App.module.scss";
import Map from "./Map";

const App: React.FC = () => {
  return (
    <div className={styles.container}>
      <Map />
    </div>
  );
};

export default App;
