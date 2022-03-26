import { ReactElement } from "react";
import styles from "./Nav.module.scss";
import { Link } from "react-router-dom";
import { NavPropType } from "../types";

const Nav: React.FC<NavPropType> = (): ReactElement => {
  return (
    <ul className={styles.container}>
      <Link to="/">
        <li className={styles.item}>Search review</li>
      </Link>
      <Link to="/new">
        <li className={styles.item}>New review</li>
      </Link>
      <Link to="/profile">
        <li className={styles.item}>Profile</li>
      </Link>
    </ul>
  );
};

export default Nav;
