import { ReactElement } from "react";
import styles from "./Nav.module.scss";
import { Link } from "react-router-dom";
import { NavPropType } from "../types";
import classNames from "classnames";

const Nav: React.FC<NavPropType> = (): ReactElement => {
  return (
    <ul className={styles.container}>
      <li className={classNames(styles.logo, styles.item)}>
        <span className={styles["logo__place"]}>Place</span>{" "}
        <span className={styles["logo__review"]}>Review</span>
      </li>
      <Link to="/" className={styles.item}>
        <li>Search review</li>
      </Link>
      <Link to="/new" className={styles.item}>
        <li>New review</li>
      </Link>
      <Link to="/profile" className={styles.item}>
        <li>Profile</li>
      </Link>
    </ul>
  );
};

export default Nav;
