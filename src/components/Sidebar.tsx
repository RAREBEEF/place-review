import { ReactElement } from "react";
import Search from "./Search";
import styles from "./Sidebar.module.scss";

const Sidebar: React.FC = (): ReactElement => {
  return (
    <div className={styles.container}>
      <Search />
    </div>
  );
};

export default Sidebar;
